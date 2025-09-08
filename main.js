
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
                const AnimationTimeline = window.ScrollTimelinePolyfill.AnimationTimeline;
                const _this = this;

                this._pauseAnimations();
    
                // Finds all the files and adds them to the parsedCSS Object 
                document.addEventListener('DOMContentLoaded', function(){
                    const parsedCSS = _this._extractCss();
                            
                    // goes through every found timeline
                    Object.keys(parsedCSS['timelines']).forEach(function(selectorTimeline){
                        const animationTimelineEls = document.querySelectorAll(selectorTimeline);

                        // Checks if there are scrollContainers with fitting names
                        const scrollContainers = Object.keys(parsedCSS['names']).map(function(selectorContainer){
                            const selector = parsedCSS['timelines'][selectorTimeline];
                            return parsedCSS['names'][selectorContainer] === selector ? selectorContainer : null;
                        });

                        // Get the container of each element
                        Array.prototype.forEach.call(animationTimelineEls, function(animationTimelineEl){
                            const check = {hasContainer: false};
                            _this._pushAnimation(null, animationTimelineEl, [0, 0, 0]);

                            scrollContainers.forEach(function(scrollContainer){
                                if(check.hasContainer) return;

                                const scrollContainerEl = animationTimelineEl.closest(scrollContainer);
                                const specifity = _this._calculateSpecificity(selectorTimeline);

                                animationTimelineEl.setAttribute('has-animation-timeline', 'TRUE');                         
                                _this._pushAnimation(scrollContainerEl, animationTimelineEl, specifity);

                                if(!!scrollContainerEl) check.hasContainer = true;
                            });
                        });
                    });

                    _this._timelineAnimations.forEach(function(timelineAnimation){
                        if(timelineAnimation.container)
                            new AnimationTimeline(timelineAnimation.container, timelineAnimation.element);
                    });

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
                const CSSParser = window.ScrollTimelinePolyfill.CSSParser;
                const cssParser = new CSSParser();                   

                parsedCSS = {'timelines': {}, 'names': {}};
                Array.prototype.forEach.call(document.querySelectorAll('style'), function(styleSheet){
                    parsedCSS = cssParser.parseTimelines(styleSheet.innerText, parsedCSS);
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
                    return false;
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
                const _this = this;
                const pausedComputed = Array.prototype.slice.call(document.querySelectorAll('[style]')).filter(function(el){
                    return getComputedStyle(el).animationPlayState === 'paused';
                });

                pausedComputed.forEach(function(stoppedAnimationEl){
                    if(!stoppedAnimationEl.getAttribute('has-animation-timeline')){
                        stoppedAnimationEl.style.removeProperty('animation-play-state');
                        _this._resetAnimation(stoppedAnimationEl);
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
             * @param { Boolean } _exists
             */
            _pushAnimation: function(container, element, specifity, _exists){
                const _this = this;
                _exists = false;

                this._timelineAnimations.forEach(function(timelineAnimation){
                    if(timelineAnimation.element === element){
                        const index = _this._timelineAnimations.indexOf(timelineAnimation);
                        const timelineEl = _this._timelineAnimations[index];
                        _exists = true;

                        if(!timelineEl.specifity || _this._compareSpecifity(specifity, timelineEl.specifity)){
                            _this._timelineAnimations[index].container = container;
                        }
                    }
                });

                if(!_exists){
                    this._timelineAnimations.push({container: container, element: element});
                }
            },

            /**
             * Calculates the specifity for a Selector
             * 
             * @param { String } selector 
             * @returns { Integer[] }
             */
            _calculateSpecificity: function(selector) {
                const idCount      = (selector.match(/#[\w-]+/g) || []).length; 
                const classCount   = (selector.match(/\.[\w-]+/g) || []).length;
                const attrCount    = (selector.match(/\[[^\]]+\]/g) || []).length;
                const pseudoClass  = (selector.match(/:[^:\s]+/g) || []).length;
                const typeCount    = (selector.match(/(^|[\s>+~])\w+/g) || []).length; 

                // b = classCount + attrCount + pseudoClass
                return [ idCount, classCount + attrCount + pseudoClass, typeCount ];
            },

            /**
             * Compares if the old specifity is higher than the new one
             * 
             * @param { Integer[] } specifity 
             * @param { Integer[] } oldSpecifity 
             * @returns { Integer }
             */
            _compareSpecifity: function(specifity, oldSpecifity){
                if (specifity[0] > oldSpecifity[0]) return 1;
                if (specifity[0] < oldSpecifity[0]) return -1;

                if (specifity[1] > oldSpecifity[1]) return 1;
                if (specifity[1] < oldSpecifity[1]) return -1;

                if (specifity[2] > oldSpecifity[2]) return 1;
                if (specifity[2] < oldSpecifity[2]) return -1;

                return 0;
            }
        }
    });

    // Creates the Main-Element
    window.scrollTimelinePolyfill = new Main();
})();
