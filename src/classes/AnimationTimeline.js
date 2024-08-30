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
             * @returns { Void }
             */
            _applyAnimationChanges: function(){
                this.element.style.display = 'none';
                this.element.style.display = '';
            }
        }
    });

    window.ScrollTimelinePolyfill.AnimationTimeline = AnimationTimeline;
})();
