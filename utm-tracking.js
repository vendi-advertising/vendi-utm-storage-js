/* jshint esversion: 6 */
(function ( window ) {

    const

        // Variable aliasing
        document = window.document,
        storage = window.sessionStorage,

        run = function() {
            const
                url = window.location.toString(),

                // These are the potential UTM parameters
                sessionKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_expid', 'utm_term', 'utm_content'],

                // Same as above but as a regex for the URL. Make sure to keep these two in sync.
                // Basically, each query string key/value should start with either a question mark or
                // an ampersand. The key must start with utm_ and then one of the keywords. The value
                // is everything that isn't another ampersand, so to the end of the line or to the
                // next key/value. We are tagging the items with named parameters, however we aren't
                // currently using that below because we didn't want to perform extra browser testing
                // since index-based has always worked.
                queryStringRegExPattern = /(?:\?|&)(?<key>utm_(?:source|campaign|medium|expid|term|content))=(?<value>[^&]+)/g
            ;

            let
                // If we find _any_ of the keywords in the URL, we will reset all UTM parameters in storage.
                // This will make sure that a campaign that is using just a subset doesn't get extra parameters
                // from a previous campaign.
                hasResetHappened = false
            ;

            // Run the regex until we can't find anything else
            while(true) {

                const
                    // When using a global regex, internal state is kept so running exec performs an iteration
                    match = queryStringRegExPattern.exec(url)
                ;

                if(!match){
                    break;
                }

                // If we found at least one thing, erase all of the UTM keys so that we don't
                // pollute campaigns that use different parts
                if(!hasResetHappened){
                    for(let i = 0; i < sessionKeys.length; i++){
                        storage.removeItem(sessionKeys[i]);
                    }
                    hasResetHappened = true;
                }

                // We could use named parameters here, but to be safe use indexes
                storage.setItem(match[1], decodeURIComponent(match[2]));
            }

            // Finally, look for hidden form fields that have an attribute of data-field-label
            // and a value that matches one of the UTM keywords.
            for(let j = 0; j < sessionKeys.length; j++){
                const
                    key = sessionKeys[j],
                    param = storage.getItem(key),
                    hiddenFields = document.querySelectorAll('input[type=hidden][data-field-label~=' + key + ']')
                ;

                if(param) {
                    for (let k = 0; k < hiddenFields.length; k++) {
                        hiddenFields[k].value = param;
                    }
                }
            }
        },

        load = function() {
            // Wait 3 seconds before actually invoking the core logic
            window.setTimeout(run, 3000);
        },

        // Wait for load.
        // TODO: Add Drupal load/ready event.
        init = function () {
            if ( [ 'complete', 'loaded', 'interactive' ].indexOf( document.readyState ) >= 0 ) {
                // If the DOM is already set, then just load
                load();
            } else {
                //Otherwise, wait for the ready event
                document.addEventListener( 'DOMContentLoaded', load );
            }
        }
    ;

    // Boot
    init();
}
( window ));
