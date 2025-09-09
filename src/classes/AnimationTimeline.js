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
             * @param { String } axis
             */
            constructor: function(scrollContainer, element, axis){
                this.scrollContainer = scrollContainer;
                this.element = element;
                this.axis = axis;
                this._addScrollListener();
            },

            /**
             * Adds a scroll listener to the scroll containers
             * 
             * @private @function _addScrollListener
             * @returns { Void }
             */
            _addScrollListener: function(){
                if(['inline', 'x'].indexOf(this.axis) >= 0){
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
                    const eventTime = _this._checkAnimationDuration();
                    const maxScroll = event.target.scrollHeight - event.target.clientHeight;
                    const newDelay = -(eventTime * ((1 / (maxScroll / event.target.scrollTop)))) + 's';
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
                    const eventTime = _this._checkAnimationDuration();
                    const maxScroll = event.target.scrollWidth - event.target.clientWidth;
                    const newDelay = -(eventTime * ((1 / (maxScroll / event.target.scrollLeft)))) + 's';
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
