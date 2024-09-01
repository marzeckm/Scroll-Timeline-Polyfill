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
                    const selectorGroup = match[1].trim();  // Selektor(en)
                    const declarations = match[2].trim();   // CSS-Eigenschaften
            
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
    const debugMessageSupported = 'This wbbbrowser supports "animation-timeline". Polyfill was skipped.';

    /**
     * The main class, object is directly created and started
     * 
     * @class Main
     */
    const Main = createClass({
        methods: {
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
                const CSSParser = window.ScrollTimelinePolyfill.CSSParser;
                const _this = this;
    
                // Stops all Animation, to check for scroll-timelines
                document.addEventListener('animationstart', function(event){
                    event.target.style.animationPlayState = "paused";
                    _this._resetAnimation(event.target);
                });
    
                // Finds all the files and adds them to the parsedCSS Object 
                document.addEventListener('DOMContentLoaded', function(){
                    const cssParser = new CSSParser();
                    var parsedCSS = {'timelines': {}, 'names': {}};
    
                    // Finds all style-nodes in the html-document
                    Array.prototype.forEach.call(document.querySelectorAll('style'), function(styleSheet){
                        parsedCSS = cssParser.parseTimelines(styleSheet.innerText, parsedCSS);
                    });
    
                    console.log(parsedCSS);
                            
                    // goes through every found timeline
                    Object.keys(parsedCSS['timelines']).forEach(function(selectorTimeline){
                        const scrollContainers = [];
    
                        // Checks if there are scrollContainers with fitting namess
                        Object.keys(parsedCSS['names']).forEach(function(selectorContainer){
                            scrollContainers.push(parsedCSS['names'][selectorContainer] === parsedCSS['timelines'][selectorTimeline] ? selectorContainer : null);
                        });
    
                        // Finds all the ScrollContainer elements
                        var scrollContainerEls = [];
                        scrollContainers.filter(function(element){ return !!element;}).forEach(function(scrollContainer){
                            scrollContainerEls = scrollContainerEls.concat(Array.prototype.slice.call(document.querySelectorAll(scrollContainer)));
                        });
            
                        // Goes through every ScrollContainer element and checks, if the animation-timeline exists
                        Array.prototype.forEach.call(scrollContainerEls, function(scrollContainerEl){
                            const animationTimelineEls = scrollContainerEl.querySelectorAll(selectorTimeline);
                            Array.prototype.forEach.call(animationTimelineEls, function(animationTimelineEl){
                                new AnimationTimeline(scrollContainerEl, animationTimelineEl);
                            });
                        });
                    });
                });
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
             * Resets the animation when hot reload is taking 
             * place in Mozilla Firefox
             * 
             * @param { HTMLElement } animationEl 
             * @returns { void }
             */
            _resetAnimation: function(animationEl){
                animationEl.style.animationName = 'reset';
                animationEl.style.animationName = '';
            }
        }
    });

    // Creates the Main-Element
    window.scrollTimelinePolyfill = new Main();
})();
