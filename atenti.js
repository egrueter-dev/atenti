/*
*
* Welcome to Atenti - a DOM Surveillance Tool for media companies
* usage: <script src="/atenti.js" data-atenti-id="123a123123"></script>
* Todo: implement api keys etc..
* Todo: Ensure that only the client can run their analytics on their website
* Todo - minify file to improve performance and obfuscate
* TODO: handle send failures as logs to server..
*
*/
(function () {
    console.log('Atenti is active');
    checkReadyState()
})();

/*
* checkReadyState 
* Check that the document is ready for the mutation observer to be added
* then apply the mutationListener
* document Node - DOCUMENT
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
* Applies the mutation listener to the page and handles logic
* when mutation to specific dom elements occur.
*/
function applyMutationListener() {
    const targetNode = document.getElementById('body');

    // Fetch Client ID and Target Tag
    // TODO: remove client id and use 'atenti' as id for poc
    const atentiData = document.head.querySelectorAll('[data-atenti-id]')[0].dataset

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
                    if (removedNode.className === atentiData.atentiTarget) {
                        sendData(window.location.hostname, atentiData.atentiTarget)
                        console.log('Atenti ID', atentiData.atentiId);
                        console.log('Atenti Target', atentiData.atentiId);
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
function sendData(hostname, element) {
    // Create function, probably async function?
    const Http = new XMLHttpRequest();
    const url = new URL('http://localhost:3000/analytics');
    const queryParams = url.searchParams;

    queryParams.set("domain", hostname);
    queryParams.set("element", element);

    // Append query params to Search attribute
    url.search = queryParams.toString();

    // Convert file to string
    const newUrl = url.toString();

    Http.open("POST", newUrl);
    Http.send();
    // TODO: handle send failures as logs to server..
}