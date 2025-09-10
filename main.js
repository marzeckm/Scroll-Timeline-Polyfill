(function(){
    'use strict';

    const createClass = window.ScrollTimelinePolyfill.createClass;
    const debugMessageSupported = 'This webbrowser supports "animation-timeline". Polyfill was skipped.';

    /**
     * The main class, object is directly created and started
     * 
     * @class Main
     */
    const Main = createClass({
        methods: {
            _timelineAnimations: [],

            /**
             * The constructor
             */
            constructor: function(){
                if (this._checkAnimationTimelineSupport()) return;
                this._main();
            },
    
            /**
             * The actual main function
             * @private @function _main
             * @returns { void }
             */
            _main: function(){
                const _this = this;

                this._pauseAnimations();
    
                // Finds all the files and adds them to the parsedCSS Object 
                document.addEventListener('DOMContentLoaded', function(){
                    const parsedCSS = _this._extractCss();
                    console.log(parsedCSS);
                            
                    _this._sanitizeTimeline(parsedCSS);
                    _this._runAnimationTimelines();

                    setTimeout(function(){
                        _this._resumeAnimations();
                    }, 100);
                });
            },

            /**
             * Extracts the CSS code from the current file
             * 
             * @private @function _extract_css
             * @returns { String }
             */
            _extractCss: function(parsedCSS){
                const cssParser = new window.ScrollTimelinePolyfill.CSSParser();
                const restService = new window.ScrollTimelinePolyfill.RestService();

                const allowExtFiles = document.querySelector('meta[name="scroll-timeline-ext_css"]');
                const styleElements = !!allowExtFiles && allowExtFiles.getAttribute('content') === 'TRUE' ? 'link[rel="stylesheet"], style' : 'style';

                parsedCSS = {scroll: {}, view: {}, container: {}};
                ScrollTimelinePolyfill.ForEachElementOf(styleElements, function(styleSheet){
                    if(styleSheet.tagName === 'LINK'){
                        parsedCSS = cssParser.parseTimelines(restService.get(styleSheet.href), parsedCSS);
                    }else{
                        parsedCSS = cssParser.parseTimelines(styleSheet.innerText, parsedCSS);
                    }
                });

                ScrollTimelinePolyfill.ForEachElementOf('[style]', function(inlineEl){
                    ['scroll-timeline', 'animation-timeline'].forEach(function(match){
                        if(inlineEl.getAttribute('style').indexOf(match) >= 0){
                            parsedCSS = cssParser.parseInlineTimelines(inlineEl, parsedCSS);
                        }
                    });
                });

                return parsedCSS;
            },
            
            /**
             * @private @function _checkAnimationTimelineSupport
             * @returns { Boolean }
             */
            _checkAnimationTimelineSupport: function(){
                if (window.CSS && window.CSS.supports && CSS.supports('animation-timeline: --works')) {
                    console.debug(debugMessageSupported);
                    return true;
                }
                return false;
            },

            /**
             * Stops all Animation, to check for scroll-timelines
             * @private @function _pauseAnimations
             * @returns { Void }
             */
            _pauseAnimations: function(){
                const _this = this;

                document.addEventListener('animationstart', function(event){
                    event.target.style.animationPlayState = "paused";
                    _this._resetAnimation(event.target);
                });
            },

            /**
             * Resumes animations of elements that are not scroll timelines
             */
            _resumeAnimations: function(){
                const pausedComputed = Array.prototype.slice.call(document.querySelectorAll('[style]')).filter(function(el){
                    return getComputedStyle(el).animationPlayState === 'paused';
                });

                pausedComputed.forEach(function(stoppedAnimationEl){
                    if(!stoppedAnimationEl.getAttribute('has-animation-timeline')){
                        stoppedAnimationEl.style.animationPlayState = 'running';
                        stoppedAnimationEl.style.removeProperty('animation-play-state');
                    }
                });
            },

            /**
             * Resets the animation when hot reload is taking 
             * place in Mozilla Firefox
             * 
             * @param { HTMLElement } animationEl 
             * @returns { void }
             */
            _resetAnimation: function(animationEl){
                animationEl.style.animationName = 'reset';
                animationEl.style.animationName = '';
            },

            /**
             * Adds an animation to the list
             * @param { HTMLElement } container
             * @param { HTMLElement } element
             * @param { Object } options
             * @param { Boolean } _exists
             */
            _pushAnimation: function(container, element, options, specifity, _exists){
                const _this = this;
                _exists = false;

                this._timelineAnimations.forEach(function(timelineAnimation){
                    if(timelineAnimation.element === element){
                        const index = _this._timelineAnimations.indexOf(timelineAnimation);
                        const timelineEl = _this._timelineAnimations[index];
                        _exists = true;

                        if(!timelineEl.specifity || _this._compareSpecifity(specifity, timelineEl.specifity)){
                            // Overwrites the values if set
                            _this._timelineAnimations[index].container = container ? container : timelineEl.container;
                            Object.keys(options).forEach(function(key){
                                _this._timelineAnimations[index].options[key] = options[key] ? options[key] : timelineEl.options[key];
                            });
                        }
                    }
                });

                if(!_exists){
                    element.setAttribute('has-animation-timeline', 'TRUE');
                    this._timelineAnimations.push({container: container, element: element, options: options});
                }
            },

            /**
             * Compares if the old specifity is higher than the new one
             * 
             * @param { Integer[] } specifity 
             * @param { Integer[] } oldSpecifity 
             * @returns { Integer }
             */
            _compareSpecifity: function(specifity, oldSpecifity){
                for(var i = 0; i <= 2; i++){
                    if (specifity[i] > oldSpecifity[i]) return 1;
                    if (specifity[i] < oldSpecifity[i]) return -1;
                }
                return 0;
            },

            /**
             * Finds the containers in the containers list that potentially
             * fit the timeline
             * 
             * @param { Object } parsedCSS 
             * @param { Object } animationTimeline 
             * @returns 
             */
            _findScrollControllers: function(parsedCSS, animationTimeline){
                return Object.keys(parsedCSS['container']).map(function(selectorContainer){
                    return parsedCSS['container'][selectorContainer].name === animationTimeline.name ? selectorContainer : null;
                });
            },

            /**
             * Sanitizes a timeline
             * 
             * @param { Object } parsedCSS 
             */
            _sanitizeTimeline: function(parsedCSS){
                const _this = this;

                Object.keys(parsedCSS['scroll']).forEach(function(selectorTimeline){
                    const animationTimeline =  parsedCSS['scroll'][selectorTimeline];
                    const scrollContainers = _this._findScrollControllers(parsedCSS, animationTimeline);

                    // Get the container of each element
                    ScrollTimelinePolyfill.ForEachElementOf(selectorTimeline, function(animationTimelineEl){
                        _this._pushAnimation(null, animationTimelineEl, {}, [0, 0, 0]);
                        if(animationTimeline.name.startsWith('--') || animationTimeline.name.includes('none')) 
                            _this._findContainerByName(parsedCSS, scrollContainers, animationTimeline, animationTimelineEl);
                        else _this._findContainerByFunction(animationTimeline, animationTimelineEl);
                    });
                });
            },

            /**
             * Tries to find a container that is specified by the name
             * 
             * @param { Object } parsedCSS 
             * @param { Object } scrollContainers 
             * @param { Object } animationTimeline 
             * @param { HTMLElement } animationTimelineEl 
             * @param { Object } result 
             * @returns 
             */
            _findContainerByName: function(parsedCSS, scrollContainers, animationTimeline, animationTimelineEl, result){
                const _this = this;
                result = false;

                scrollContainers.forEach(function(scrollContainer){
                    if(result) return;
                    const scrollContainerEl = (animationTimeline.name == 'none' ? document.createElement('div') : animationTimelineEl.closest(scrollContainer));
                    const axis = parsedCSS['container'][scrollContainer] ? parsedCSS['container'][scrollContainer].axis : null;

                    _this._pushAnimation(scrollContainerEl, animationTimelineEl, {axis: axis, type: scroll}, animationTimeline.specifity);
                    if(!!scrollContainerEl) result = true;
                });
            },

            /**
             * 
             * @param { Object } animationTimeline 
             * @param { HTMLElement } animationTimelineEl 
             */
            _findContainerByFunction: function(animationTimeline, animationTimelineEl){
                const options = {};
                const _this = this;
                const containers = {
                    root: function(){return window;},
                    self: function(){return animationTimelineEl;},
                    nearest: function(){return _this._findNearestContainer(animationTimelineEl, options);}
                };

                if(animationTimeline.name.startsWith('scroll(')){
                    const inner = animationTimeline.name.slice(7, -1).trim();
                    const parts = inner.split(/\s+/);

                    options.type = 'scroll';
                    options.scroller = parts.find(function(p){ return ['root', 'self', 'nearest'].includes(p) }) || 'nearest';
                    options.axis = parts.find(function(p){ return ['x', 'y', 'block', 'inline'].includes(p) }) || 'block';

                    this._pushAnimation(containers[options.scroller](), animationTimelineEl, options, animationTimeline.specifity);
                } else if(animationTimeline.name.startsWith('view(')) {
                    const inner = animationTimeline.name.slice(5, -1).trim();
                    const parts = inner.split(/\s+/);

                    options.type = 'view';
                    options.axis = parts[0] || 'block';
                    options.insetStart = parts[1] || '0%';
                    options.insetEnd = parts[2] || '100%';
                }

            },

            /**
             * 
             * @param { HTMLElement } currentElement 
             * @param { Object } options 
             * @returns 
             */
            _findNearestContainer: function(currentElement, options){
                if(!currentElement || !currentElement.parentNode) return window;
                const style = window.getComputedStyle(currentElement);

                switch (style.position) {
                    case 'fixed':
                        return window;

                    case 'absolute':
                        return this._findNearestContainer(currentElement.offsetParent, options);

                    default:
                        const isHorizontalScroll = ['inline', 'x'].includes(options.axis);
                        const hasHorizontalOverflow = ['auto', 'scroll'].includes(style.overflowX);
                        const hasVerticalOverflow = ['auto', 'scroll'].includes(style.overflowY);

                        if((isHorizontalScroll && hasHorizontalOverflow) || hasVerticalOverflow) return currentElement;
                        else return this._findNearestContainer(currentElement.parentElement, options);
                }
            },

            /**
             * Starts the defined animation timelines
             */
            _runAnimationTimelines: function(){
                const AnimationTimeline = window.ScrollTimelinePolyfill.AnimationTimeline;

                this._timelineAnimations.forEach(function(timelineAnimation){
                    if(timelineAnimation.container)
                        new AnimationTimeline(timelineAnimation.container, timelineAnimation.element, timelineAnimation.options);
                });
            }
        }
    });

    // Creates the Main-Element
    window.scrollTimelinePolyfill = new Main();
})();