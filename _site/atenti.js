/*
*
* Welcome to Atenti - a DOM Surveillance Tool for media companies
* usage: <script src="/atenti.js" data-atenti-id="123a123123"></script>
* Todo: implement api keys etc..
* Todo: Ensure that only the client can run their analytics on their website
* Todo: OTP Stuff
* Todo - minify file to improve performance and obfuscate
* TODO: handle send failures as logs to server..
*
*/
(function () {
    'use strict'
    console.log('Atenti is active');

    // save the original method before overwriting them
    EventTarget.prototype._addEventListener = Element.prototype.addEventListener;

    /**
     * [addEventListener description]
     * @param {[type]}  type       [description]
     * @param {[type]}  listener   [description]
     * @param {Boolean} useCapture [description]
     */
    EventTarget.prototype.addEventListener = function (type, listener, useCapture = false) {
        // declare listener
        this._addEventListener(type, listener, useCapture);

        if (!this.eventListenerList) this.eventListenerList = {};
        if (!this.eventListenerList[type]) this.eventListenerList[type] = [];

        // add listener to  event tracking list
        this.eventListenerList[type].push({ type, listener, useCapture });
    };

    /**
    * [removeEventListener description]
    * @param  {[type]}  type       [description]
    * @param  {[type]}  listener   [description]
    * @param  {Boolean} useCapture [description]
    * @return {[type]}             [description]
    */
    Element.prototype.removeEventListener = function (type, listener, useCapture = false) {
        // remove listener
        this._removeEventListener(type, listener, useCapture);

        if (!this.eventListenerList) this.eventListenerList = {};
        if (!this.eventListenerList[type]) this.eventListenerList[type] = [];

        // Find the event in the list, If a listener is registered twice, one
        // with capture and one without, remove each one separately. Removal of
        // a capturing listener does not affect a non-capturing version of the
        // same listener, and vice versa.
        for (let i = 0; i < this.eventListenerList[type].length; i++) {
            if (this.eventListenerList[type][i].listener === listener && this.eventListenerList[type][i].useCapture === useCapture) {
                this.eventListenerList[type].splice(i, 1);
                break;
            }
        }
        // if no more events of the removed event type are left,remove the group
        if (this.eventListenerList[type].length == 0) delete this.eventListenerList[type];
    };

    /**
    * [getEventListeners description]
    * @param  {[type]} type [description]
    * @return {[type]}      [description]
    */
    EventTarget.prototype.getEventListeners = function (type) {
        if (!this.eventListenerList) this.eventListenerList = {};

        // return reqested listeners type or all them
        if (type === undefined) return this.eventListenerList;
        return this.eventListenerList[type];
    };

    // TODO: Remove 'beforeUnload' event listeners created after the page
    // Loads. you want to preserve anything there prior to page load.
    // probaby need to listen to events.
    //
    // https://developer.mozilla.org/en-US/docs/Web/API/BeforeUnloadEvent


    // Very important. This must be removed to prevent the user from stopping a refresh
    // Is this still needed?
    // there may be other attributes that need to be removed.
    delete window.onbeforeunload;


    checkReadyState();
})();

/**
* [checkReadyState Check that the document is ready for 
* the mutation observer to be added, then apply the mutationListener]
*/
function checkReadyState() {
    if (document.readyState === 'ready' || document.readyState === 'complete') {
        applyMutationListener();
    } else {
        document.onreadystatechange = function () {
            if (document.readyState == "complete") {
                applyMutationListener();
            }
        };
    }
}

/*
* [applyMutationListener]
* Applies the mutation listener to the page and handles logic
* when mutation to specific dom elements occur.
*/
function applyMutationListener() {
    // target <html> and all children for observation
    const targetNode = document.documentElement;

    // Fetch Client ID and Target Tag
    // TODO: remove client id and use 'atenti' as id for poc
    const atentiData = document.head.querySelectorAll('[data-atenti-id]')[0].dataset;

    // Options for the observer (which mutations to observe)
    // TODO: clean up options
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {

        // Use traditional 'for loops' for IE 11
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const removedNode = mutation.removedNodes[0];

                if (removedNode) {

                    if (removedNode.dataset["atentiId"] !== undefined) {
                        // Important that we re-load from window, not document
                        // so we can overthrow any listeners targeted to
                        // window specifically.
                        // Log event
                        window.location.reload();
                        console.log("Atenti removal");
                    }

                    if (removedNode.className === atentiData.atentiTarget) {
                        sendData(window.location.hostname, atentiData.atentiTarget);
                       window.location.reload();
                    }
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}

/*
* Send data to the Atenti Back End
* @param hostname : the host site where the script runs
* @param element : the DOM element that was modified by the user
*/
function sendData(hostname, node) {
    // Create function, probably async function?
    const Http = new XMLHttpRequest();
    const url = new URL('http://localhost:3000/api/v1/events');
    const queryParams = url.searchParams;

    queryParams.set("domain", hostname);
    queryParams.set("node", node);

    // Append query params to Search attribute
    url.search = queryParams.toString();

    // Convert file to string
    const newUrl = url.toString();

    Http.open("POST", newUrl);
    Http.send();
    // TODO: handle send failures as logs to server..
}