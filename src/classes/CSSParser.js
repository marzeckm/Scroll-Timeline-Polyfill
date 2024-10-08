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
