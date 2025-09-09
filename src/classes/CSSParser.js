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
                            parsedTimelines['timelines'][selector] = {
                                name: animationTimelineMatch,
                                specifity: _this._calculateSpecificity(selector)
                            }
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
                    parsedTimelines['timelines'][selector] = {
                        name: animationTimelineMatch,
                        specifity: [999, 0, 0]
                    }
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
