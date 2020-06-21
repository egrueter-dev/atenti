/*
*
* Welcome to Atenti - a DOM Surveillance Tool for media companies
* usage: <script src="/atenti.js" data-atenti-id="123a123123"></script>
* Todo: implement api keys etc..
* Todo: Ensure that only the client can run their analytics on their website
*
*/
(function () {
    console.log('Atenti is active');
    checkReadyState()
})();

/*
* checkReadyState 
* Check that the document is ready for the mutation observer to be added
* document Node - the document node
*/
function checkReadyState() {
    if (document.readyState === 'ready' || document.readyState === 'complete') {
        applyMutationListener();
    } else {
        document.onreadystatechange = function () {
            if (document.readyState == "complete") {
                applyMutationListener();
            }
        }
    }
}

/*
* applyMutationListener
* TODO: Annotate properly
*/
function applyMutationListener() {
    const targetNode = document.getElementById('body');

    // Fetch Client ID and Target Tag
    const atentiData = document.head.querySelectorAll('[data-atenti-id]')[0].dataset

    // Options for the observer (which mutations to observe)
    // Can probably dump some of these
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {

                const removedNode = mutation.removedNodes[0];

                if (removedNode) {
                    if (removedNode.className === atentiData.atentiTarget) {
                        console.log(atentiData.atentiId);
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