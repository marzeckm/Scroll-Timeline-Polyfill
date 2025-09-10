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
/**
 * Polyfill for [].find (Finds an element in an array)
 */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate, thisArg) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    var list = Object(this);
    var length = list.length >>> 0;

    for (var i = 0; i < length; i++) {
      var value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

/**
 * Polyfill for [].includes
 */
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);
    var len = o.length >>> 0;

    if (len === 0) {
      return false;
    }

    var n = fromIndex | 0;
    var k = Math.max(n >= 0 ? n : len + n, 0);

    while (k < len) {
      // SameValueZero comparison
      if (o[k] === searchElement || (typeof o[k] === 'number' && typeof searchElement === 'number' && isNaN(o[k]) && isNaN(searchElement))) {
        return true;
      }
      k++;
    }

    return false;
  };
}

/**
 * Polyfills the method includes for strings in browsers
 * that dont support the method
 */
if (!String.prototype.includes) {
  String.prototype.includes = function(searchString) {
    return this.indexOf(searchString) >= 0;
  }
}

/**
 * Polyfills the method startsWith for Strings in browsers
 * that dont support the method
 */
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    var pos = position || 0;
    return this.substr(pos, searchString.length) === searchString;
  };
}

/*
 * Polyfill for Element.matches (IE11 and older browsers)
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

/**
 * Polyfill to generate a UUID for older Browsers like Internet Explorer 11
 */
(function () {
  if (typeof window.crypto === 'undefined') {
    window.crypto = {};
  }

  if (typeof window.crypto.randomUUID !== 'function') {
    window.crypto.randomUUID = function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
})();
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
                            parsedTimelines['timelines'][selector] = _this._sanitizeAnimationTimeline(animationTimelineMatch, _this._calculateSpecificity(selector));
                        }

                        if(scrollTimelineNameMatch){
                            parsedTimelines['names'][selector] = scrollTimelineNameMatch
                        }
                    });
                }
            
                return parsedTimelines;
            },

            /**
             * Parses inline CSS Code
             * 
             * @param { HTMLElement } element 
             * @param { Object } parsedTimelines 
             * @returns 
             */
            parseInlineTimelines: function(element, parsedTimelines){
                const uuid = crypto.randomUUID();
                const selector = ['[scroll-timeline-id="', uuid, '"]'].join('');

                const animationTimelineMatch = this._checkAnimationTimeline(element.getAttribute('style'));
                const scrollTimelineNameMatch = this._checkScrollTimelineName(element.getAttribute('style'));

                element.setAttribute('scroll-timeline-id', uuid);

                if(animationTimelineMatch){
                    parsedTimelines['timelines'][selector] = this._sanitizeAnimationTimeline(animationTimelineMatch, [999, 0, 0]);
                }

                if(scrollTimelineNameMatch){
                    parsedTimelines['names'][selector] = scrollTimelineNameMatch
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
             * 
             * @param { String } val 
             * @param { Integer[] } specifity 
             */
            _sanitizeAnimationTimeline: function(val, specifity){
                return {name: val, specifity: specifity};
            },

            /**
             * @param { String } declarations
             * @returns { String | null}
             */
            _checkScrollTimelineName: function(declarations){
                const scrollTimeline = {name: null, axis: 'block'};
                const scrollTimelineMatch = declarations.match(/scroll-timeline\s*:\s*([^;]+)/);
                const scrollTimelineNameMatch = declarations.match(/scroll-timeline-name\s*:\s*([^;]+)/);
                const scrollTimelineAxisMatch = declarations.match(/scroll-timeline-axis\s*:\s*([^;]+)/);

                if(scrollTimelineMatch){
                    const temp = scrollTimelineMatch[1].trim().split(' ');
                    scrollTimeline.name = temp[0];
                    scrollTimeline.axis = temp[1] ? temp[1] : scrollTimeline.axis;
                }

                scrollTimeline.name = scrollTimelineNameMatch ? scrollTimelineNameMatch[1].trim() : scrollTimeline.name;
                scrollTimeline.axis = scrollTimelineAxisMatch ? scrollTimelineAxisMatch[1].trim() : scrollTimeline.axis;

                return !!scrollTimeline.name ? scrollTimeline : null;
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
        }
    });

    window.ScrollTimelinePolyfill.CSSParser = CSSParser;
})();
(function() { 
    'use strict';

    const createClass = window.ScrollTimelinePolyfill.createClass;

    /**
     * Helper for making GET-Requests
     * 
     * @class RestService
     */
    const RestService = createClass({
        methods: {
            /**
             * The constructor
             */
            constructor: function(){
                // Nothing to do
            },

            get: function(url) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, false); // false = synchrone

                try {
                    xhr.send();
                    if (xhr.status >= 200 && xhr.status < 300) {
                        return xhr.responseText;
                    } else {
                        console.error('Error in Request:', xhr.status);
                        return null;
                    }
                } catch (e) {
                    console.error('Request cancelled due to error:', e);
                    return null;
                }
            }
        }
    });

    window.ScrollTimelinePolyfill.RestService = RestService;
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
             * @param { Object } options
             */
            constructor: function(scrollContainer, element, options){
                console.log(scrollContainer, element, options);
                this.scrollContainer = scrollContainer;
                this.element = element;
                this.options = options;
                this._addScrollListener();
            },

            /**
             * Adds a scroll listener to the scroll containers
             * 
             * @private @function _addScrollListener
             * @returns { Void }
             */
            _addScrollListener: function(){
                if(['inline', 'x'].indexOf(this.options.axis) >= 0){
                    this._addScrollListenerInline();
                }else{
                    this._addScrollListenerBlock();
                }
            },

            /**
             * Adds a Scroll Listener if the element has axis: block | y
             * 
             * @private @function _addScrollListenerBlock
             * @returns { Void }
             */
            _addScrollListenerBlock: function(){
                const _this = this;

                this.scrollContainer.addEventListener('scroll', function(event){
                    const element = (event.target == document ? document.documentElement : event.target);

                    const eventTime = _this._checkAnimationDuration();
                    const maxScroll = element.scrollHeight - element.clientHeight;
                    const newDelay = -(eventTime * ((1 / (maxScroll / element.scrollTop)))) + 's';
                    _this.element.style.animationDelay = newDelay;
                    _this._applyAnimationChanges();
                });
            },

            /**
             * Adds a Scroll Listener if the element has axis: inline | x
             * 
             * @private @function _addScrollListenerInline
             * @returns { Void }
             */
            _addScrollListenerInline: function(){
                const _this = this;

                this.scrollContainer.addEventListener('scroll', function(event){
                    const element = (event.target == document ? document.documentElement : event.target);

                    const eventTime = _this._checkAnimationDuration();
                    const maxScroll = element.scrollWidth - element.clientWidth;
                    const newDelay = -(eventTime * ((1 / (maxScroll / element.scrollLeft)))) + 's';
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

                parsedCSS = {'timelines': {}, 'names': {}};
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
                return Object.keys(parsedCSS['names']).map(function(selectorContainer){
                    return parsedCSS['names'][selectorContainer].name === animationTimeline.name ? selectorContainer : null;
                });
            },

            /**
             * Sanitizes a timeline
             * 
             * @param { Object } parsedCSS 
             */
            _sanitizeTimeline: function(parsedCSS){
                const _this = this;

                Object.keys(parsedCSS['timelines']).forEach(function(selectorTimeline){
                    const animationTimeline =  parsedCSS['timelines'][selectorTimeline];
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
                    const axis = parsedCSS['names'][scrollContainer] ? parsedCSS['names'][scrollContainer].axis : null;

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

                console.log(this._timelineAnimations);
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