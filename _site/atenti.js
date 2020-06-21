/*
*
* Welcome to Atenti - a DOM Surveillance Tool for media companies
* usage:  <script src="/atenti.js">
* Todo: implement api keys etc..
* Todo: Ensure that only the client can run their analytics on their website
*
*/
(function (document) {
    console.log('Atenti is active');
    checkReadyState(document)
})(window.document);

/*
* checkReadyState 
* Check that the document is ready for the mutation observer to be added
* document Node - the document node
*/
function checkReadyState(document) {
    if (document.readyState === 'ready' || document.readyState === 'complete') {
        applyMutationListener(document);
    } else {
        document.onreadystatechange = function () {
            if (document.readyState == "complete") {
                applyMutationListener(document);
            }
        }
    }
}

/*
* applyMutationListener
* TODO: Annotate
*/
function applyMutationListener(document) {
    const targetNode = document.getElementById('body');

    // Options for the observer (which mutations to observe)
    // Can probably dump some of these
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.');
                console.log(mutation.removedNodes[0]);
                // Check which node was mutated
                // Fire API Call if specific node was indeed hit
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    console.log(document)

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config)
}




/*
* Backend Interface Functions
*/

function callBackEnd() {

}

