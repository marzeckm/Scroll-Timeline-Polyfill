
(function(){
    const createClass = window.ScrollTimelinePolyfill.createClass;

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
             */
            _main: function(){
                const AnimationTimeline = window.ScrollTimelinePolyfill.AnimationTimeline;
                const CSSParser = window.ScrollTimelinePolyfill.CSSParser;
                const _this = this;
    
                // Stops all Animation, to check for scroll-timelines
                document.addEventListener('animationstart', function(event){
                    event.target.style.animationPlayState = "paused";
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
                    console.debug('This wbbbrowser supports "animation-timeline". Polyfill was skipped.');
                    return true;
                }
                return false;
            }
        }
    });

    // Creates the Main-Element
    window.scrollTimelinePolyfill = new Main();
})();
