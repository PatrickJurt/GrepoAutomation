function executeTask() {
  console.log("Checking for Grepolis tabs..."); // Log when the task starts
  chrome.tabs.query({ url: "*://*.grepolis.com/*" }, (tabs) => {
    console.log("Found tabs:", tabs); // Log the found tabs
    if (tabs.length > 0) {
      let grepolisTabId = tabs[0].id;
      console.log("Injecting autofarmercontent script into tab:", grepolisTabId); // Log tab ID
      chrome.scripting.executeScript(
          {
            target: { tabId: grepolisTabId },
            files: ['autofarmercontent.js'],
          },
          (injectionResults) => {
            if (chrome.runtime.lastError) {
              console.error("Script injection failed: ", chrome.runtime.lastError.message);
            } else {
              console.log("Script injected successfully into tab:", grepolisTabId, injectionResults);
            }
          }
      );
    } else {
      console.log("No Grepolis tabs found.");
    }
  });
}

// Execute the task once when the extension is loaded
executeTask();
