/*
TODO

- Manche Städte 5min / 10min Ressi
- Interface
- Gratis Bauschleife
- Bei Ext Reload mehrfaches laufen der Extension
- Bei vollem Lager kein farmen




*/



function executeTask() {
  console.log("Checking for Grepolis tabs..."); // Log when the task starts
  chrome.tabs.query({ url: "*://*.grepolis.com/*" }, (tabs) => {
    console.log("Found tabs:", tabs); // Log the found tabs
    if (tabs.length > 0) {
      let grepolisTabId = tabs[0].id;
      console.log("Injecting contents script into tab:", grepolisTabId); // Log tab ID
      chrome.scripting.executeScript(
          {
            target: { tabId: grepolisTabId },
            files: ['FarmingAutomationContent.js', 'AutoFinishBuilding.js'],
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
