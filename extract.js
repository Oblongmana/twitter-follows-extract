// ******************************************
//    Init/Reset
// ******************************************

var followParentContainer;

var followParentContainerMutationObserver;
var followMutationObserver;

var followerRows;
var followingRows;

if (followMutationObserver) {
    followMutationObserver.disconnect();
}
if (followParentContainerMutationObserver) {
    followParentContainerMutationObserver.disconnect();
}

followParentContainer = null;
followerRows = {}; 
followingRows = {};

// ******************************************
//    Utility Functions
// ******************************************

function recursiveFirstChildAtDepth(elem, depth)
{
    if (depth > 0 && elem.children.length > 0) {
        return recursiveFirstChildAtDepth(elem.children[0], depth - 1);
    } else {
        return elem;
    }
}

function captureFollowRows(rowCollectionNameForLogging, rowCollectionObject, row) {
    var rowContent = recursiveFirstChildAtDepth(row, 4); //child 0 = picture structure, 1 = text/followButton content structure
    var textContent = rowContent.children[1]; //child 0 = header + followButton structure, 1 = bio structure
    var headerContent = recursiveFirstChildAtDepth(textContent, 3); // 0 = display name structure, 1 = @ 
    var handle = headerContent.children[1].children[0].textContent; //nb: going an extra level down to avoid getting the "follows you" jumbled into the handle
    var displayName = headerContent.children[0].textContent;

    if (!rowCollectionObject.hasOwnProperty(handle)) {
        rowCollectionObject[handle] = { handle, displayName };
        console.log(`Captured a new ${rowCollectionNameForLogging} row (current count = ${Object.keys(rowCollectionObject).length}). Use saveCsvText() when ready to save. `, rowCollectionObject[handle]);
    }
}

//Creates a console.save command
//  http://bgrins.github.io/devtools-snippets/#console-save
(function(console){

    console.save = function(data, filename){

        if(!data) {
            console.error('Console.save: No data')
            return;
        }

        if(!filename) filename = 'console.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)

function generateCsvText(theRows) {
    return "\ufeff" + //UTF-8-with-BOM byte, so excel doesn't mangle characters
        "handle,displayName\n" +
        Object.values(theRows).map(({ handle, displayName }) => [
            `"${handle}"`,
            `"${displayName}"`
        ].join(",")).join("\n");
    
}

function saveCsvs() {
    console.save(generateCsvText(followerRows), "followers.csv");
    console.save(generateCsvText(followingRows), "following.csv");
}

// ******************************************
//    Begin observing
// ******************************************

//Watch the followParent for switches between following/followers tabs
followParentContainer = document.querySelector('[aria-label="Timeline: Following"]');
if (followParentContainer == null) {
    followParentContainer = document.querySelector('[aria-label="Timeline: Followers"]');
}

if (followParentContainer) {
    //Begin observing whatever the current follower/following view is
    updateObserverWiring();

    //Monitor for tab switches between follower/following
    followParentContainerMutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName != null) {
                updateObserverWiring();
            }
        });
    });
    
    followParentContainerMutationObserver.observe(followParentContainer, {
        attributes: true,
        attributeFilter: ["aria-label"],
        characterData: false,
        childList: false,
        subtree: false,
        attributeOldValue: false,
        characterDataOldValue: false
    });
} else {
    console.error("Could not find Followers/Following Tab. Wait for the page to load, or try reloading the page");
}

function updateObserverWiring() {
    //Disconnect any existing follower/following observer
    if (followMutationObserver) {
        followMutationObserver.disconnect()
    }

    //Determine whether follower or following is displayed
    var captureContainer = document.querySelector('[aria-label="Timeline: Following"]');
    var nameForLogging;
    var captureObject;
    if (captureContainer) {
        nameForLogging = "Following";
        captureObject = followingRows;
    } else {
        captureContainer = document.querySelector('[aria-label="Timeline: Followers"]')
        if (captureContainer) {
            nameForLogging = "Followers";
            captureObject = followerRows;
        }
    }

    if (captureContainer) {
        console.log(`Switched Tabs to ${nameForLogging}`);
        //Watch/capture new rows for the follower or following tab
        captureContainer = captureContainer.children[0];

        followMutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function (addedNode) {
                        captureFollowRows(nameForLogging, captureObject, addedNode);
                    })
                }
            });
        });
        
        followMutationObserver.observe(captureContainer, {
            attributes: false,
            characterData: false,
            childList: true,
            subtree: false,
            attributeOldValue: false,
            characterDataOldValue: false
        });
    }
}
