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
