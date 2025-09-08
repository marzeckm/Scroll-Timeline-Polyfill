/**
 * Helper, that creates an object in the window object.
 * Here everything will be added to save namespace in the global element
 */
(function(){
    'use strict';
    
    window.ScrollTimelinePolyfill = {};
})();
/**
 * Helper for creating ES5-Classes
 * 
 * @polyfill classCreator
 */
(function() {
    'use strict';

    const errorInstantiateClass = 'Cannot instantiate abstract class directly.';

    /**
     * Is called, when someone tries to create 
     * Object of Class
     */
    function Class() {
        if (this.constructor === Class) {
            throw new Error(errorInstantiateClass);
        }
    }

    /**
     * Adds the functionality of extending classes
     * 
     * @param { Object} Child 
     * @param { Object } Parent 
     * @returns { void }
     */
    function extend(Child, Parent) {
        Child.prototype = Object.create(Parent.prototype);
        Child.prototype.constructor = Child;
    }

    /**
     * Creates a new ES5-Class
     * 
     * @param { {extends?: Class, methods?: {}, properties: {}} } definition 
     * @returns { Object<T> }
     */
    function createClass(definition) {
        var Parent = definition.extends || Class;
        var Methods = definition.methods || {};
        var StaticMethods = definition.staticMethods || {};
        var Properties = definition.properties || {}; 

        function ClassConstructor() {
            if (Parent !== Class) {
                Parent.apply(this, arguments);
            }

            if (Methods.constructor) {
                Methods.constructor.apply(this, arguments);
            }
        }

        extend(ClassConstructor, Parent);

        for (var key in Methods) {
            if (Methods.hasOwnProperty(key)) {
                ClassConstructor.prototype[key] = Methods[key];
            }
        }

        for (var staticKey in StaticMethods) {
            if (StaticMethods.hasOwnProperty(staticKey)) {
                ClassConstructor[staticKey] = StaticMethods[staticKey];
            }
        }

        for (var prop in Properties) {
            if (Properties.hasOwnProperty(prop)) {
                Object.defineProperty(ClassConstructor.prototype, prop, {
                    get: Properties[prop].get || function() {},
                    set: Properties[prop].set || function() {},
                    enumerable: true,
                    configurable: true
                });
            }
        }

        return ClassConstructor;
    }

    window.ScrollTimelinePolyfill.createClass = createClass;
}());
/*
 * Polyfill für Element.matches (IE11 und ältere Browser)
 */ 
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    function(selector) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
      for (var i = 0; i < matches.length; i++) {
        if (matches[i] === this) return true;
      }
      return false;
    };
}

/**
 * Polyfill für Element.closest (IE11 und ältere Browser)
 */
if (!Element.prototype.closest) {
  Element.prototype.closest = function(selector) {
    var el = this;
    do {
      if (el.matches(selector)) return el;
      el = el.parentElement || el.parentNode;
    } while (el && el.nodeType === 1);
    return null;
  };
}
(function() { 
    'use strict';

    const createClass = window.ScrollTimelinePolyfill.createClass;

    /**
     * Helper for parsing the CSS to get all animation names
     * and animation timelines.
     * 
     * @class CSSParser
     */
    const CSSParser = createClass({
        methods: {
            /**
             * The constructor
             */
            constructor: function(){
                // Nothing to do
            },

            /**
             * parses CSS code
             * 
             * @function parseCSSTimelines
             * @param { String } cssText 
             * @param { Object } parsedTimelines 
             * @returns { Object }
             */
            parseTimelines: function(cssText, parsedTimelines){
                cssText = this._removeComments(cssText);
                cssText = this._removeKeyframes(cssText);
                cssText = this._removeMediaQueries(cssText);
            
                // Regex, to collect all CSS-Rules
                const ruleRegex = /([^{]+)\{([^}]+)\}/g;
                var match;
            
                while ((match = ruleRegex.exec(cssText)) !== null) {
                    const selectorGroup = match[1].trim();  // Selector(s)
                    const declarations = match[2].trim();   // CSS property
            
                    // Split selectors, when multiple are available
                    const selectors = selectorGroup.split(',');
            
                    // go through every selector
                    const _this = this;
                    selectors.forEach(function(selector) {
                        selector = selector.trim();                        

                        const animationTimelineMatch = _this._checkAnimationTimeline(declarations);
                        const scrollTimelineNameMatch = _this._checkScrollTimelineName(declarations);

                        if(animationTimelineMatch){
                            parsedTimelines['timelines'][selector] = animationTimelineMatch;
                        }

                        if(scrollTimelineNameMatch){
                            parsedTimelines['names'][selector] = scrollTimelineNameMatch
                        }
                    });
                }
            
                return parsedTimelines;
            },

            /**
             * Removes all comments from the code,
             * to make the css parsing easier
             * 
             * @param { String } cssText 
             * @returns { String }
             */
            _removeComments: function(cssText){
                return cssText.replace(/\/\*[\s\S]*?\*\//g, '');
            },

            /**
             * Removes all Keyframes from code,
             * since they are not supported at the moment
             * 
             * @param { String } cssText 
             * @returns { String }
             */
            _removeKeyframes: function(cssText) {
                return cssText.replace(/@keyframes\s+[^{]+\{(?:[^{}]*\{[^}]*\}[^{}]*|\s)*\}/g, '');
            },

            /**
             * Removes all Media-Queries from Code,
             * since they are not supported at the moment
             * 
             * @param { String } cssText 
             * @returns { String }
             */
            _removeMediaQueries: function(cssText) {
                return cssText.replace(/@media[^{]*\{([^{}]*\{[^}]*\}[^{}]*|\s)*\}/g, '');
            },            

            /**
             * 
             * @param { String } declarations 
             * @returns { String | null }
             */
            _checkAnimationTimeline: function(declarations){
                const animationTimelineMatch = declarations.match(/animation-timeline\s*:\s*([^;]+)/);
                return animationTimelineMatch ? animationTimelineMatch[1].trim() : null;
            },

            /**
             * @param { String } declarations
             * @returns { String | null}
             */
            _checkScrollTimelineName: function(declarations){
                const scrollTimelineNameMatch = declarations.match(/scroll-timeline-name\s*:\s*([^;]+)/);
                return scrollTimelineNameMatch ? scrollTimelineNameMatch[1].trim() : null;
            }
        }
    });

    window.ScrollTimelinePolyfill.CSSParser = CSSParser;
})();
(function(){
    'use strict';

    const createClass = window.ScrollTimelinePolyfill.createClass;

    /**
     * Contains an AnimationTimeline-Element
     * @class { AnimationTimeline }
     */
    const AnimationTimeline = createClass({
        methods: {
            /**
             * The constructor 
             * 
             * @param { HTMLElement } scrollContainer 
             * @param { HTMLElement } element 
             */
            constructor: function(scrollContainer, element){
                this.scrollContainer = scrollContainer;
                this.element = element;
                this._addScrollListener();
            },

            /**
             * Adds a scroll listener to the scroll containers
             * 
             * @private @function _addScrollListener
             * @returns { void }
             */
            _addScrollListener: function(){
                const _this = this;
                this.scrollContainer.addEventListener('scroll', function(event){
                    const eventTime = _this._checkAnimationDuration();
                    const maxScroll = event.target.scrollHeight - event.target.clientHeight;
                    const newDelay = -(eventTime * ((1 / (maxScroll / event.target.scrollTop)))) + 's';
                    _this.element.style.animationDelay = newDelay;
                    _this._applyAnimationChanges();
                });
            },

            /**
             * Checks the animation duration adds a duration,
             * if animation does not have one yet
             * 
             * @private @function _checkAnimationDuration
             * @returns { Number }
             */
            _checkAnimationDuration: function(){
                const eventDuration = window.getComputedStyle(this.element).animationDuration;

                if(!eventDuration || eventDuration == '0s'){
                    this.element.style.animationDuration = '1s';
                }

                return (1 * window.getComputedStyle(this.element).animationDuration.replace('s', ''));
            },

            /**
             * This fix is needed for IE11 support
             * 
             * @private @function _applyAnimationChanges
             * @returns { void }
             */
            _applyAnimationChanges: function(){
                this.element.style.display = 'none';
                this.element.style.display = '';
            }
        }
    });

    window.ScrollTimelinePolyfill.AnimationTimeline = AnimationTimeline;
})();

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
