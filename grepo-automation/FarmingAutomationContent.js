(function() {

    const FARMING_DELAY = 601000;
    let click_delay = 0;
    let intervalId;

    if (window.farmingAutomation) {
        console.log("Click automation is already running.");
        return;
    }

    window.farmingAutomation = true;

    function awaitLoading(){
        return new Promise((resolve) => {
            const checkExistence = setInterval(() => {
                const loader = document.getElementById('ajax_loader');
                if (loader){
                    if (loader.style.visibility === 'hidden'){
                        clearInterval(checkExistence);
                        resolve();
                    }
                } else{
                    resolve();
                }
            }, 100);
        });
    }

    function calculateNextFarming() {
        const currentTime = new Date().getTime();
        return currentTime + FARMING_DELAY;
    }

    async function clickElement(querySelector) {
        const element = document.querySelector(querySelector);
        if (element) {
            element.click();
            await awaitLoading();
            await new Promise(resolve => setTimeout(resolve, click_delay));
        } else {
            console.log(`Element not found for selector: ${querySelector}`);
        }
    }

    async function performClicks() {
        console.log('Farming at', (new Date()).toTimeString().split(' ')[0]);
        const nextFarmingTime = calculateNextFarming();
        chrome.storage.sync.set({ nextExecution: nextFarmingTime });
        clickElement('div[class="caption js-viewport"]')
        await new Promise(resolve => setTimeout(resolve, click_delay));

        clickElement('li[data-option-id="profile"]');

        await awaitLoading();
        const playerInfo = document.querySelector('div#player_info');

        let playerInfoText;
        if (playerInfo){
            playerInfoText = playerInfo.textContent.trim();
        }else{
            console.log('Could not find playerInfo (FarmingAutomationContent.js:55)');
        }

        /*
        Only add the url of one city per island
        To find the city url, go to profile, open dev tools and select the city
        This will highlight an anchor element with a href to copy the url from
        To find the farming island url, go to city info, open dev tools and select the island
        This will highlight an anchor element with a href to copy the url from
        */
        let villages = [];
        if (playerInfoText.includes('HansliHornochse')){
            villages = [
                {
                    cityName: "Bahnhof",
                    townID:"31",
                    cityURL: "#eyJpZCI6MzEsIml4Ijo1MDIsIml5Ijo1MDksInRwIjoidG93biIsIm5hbWUiOiJCYWhuaG9mIn0=",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MDIzNiwiaXgiOjUwMiwiaXkiOjUwOSwicmVzIjoiU3ciLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Gananosdra",
                        "Hynos",
                        "Rhodradougav",
                        "Rhohy",
                        "Tarho",
                        "Nosgi"
                    ]
                }
            ];
        }
        if(playerInfoText.includes('HugoHornochse')){
            villages = [
                {
                    cityName: "Hoger",
                    townID:"62",
                    cityURL: "#eyJpZCI6NjIsIml4Ijo1MDIsIml5Ijo1MDksInRwIjoidG93biIsIm5hbWUiOiJIb2dlciJ9",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MDIzNiwiaXgiOjUwMiwiaXkiOjUwOSwicmVzIjoiU3ciLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Nosgi",
                        "Hynos",
                        "Gananosdra",
                        "Rhohy",
                        "Rhodradougav",
                        "Tarho"
                    ]
                }
            ];
        }

        for (const city of villages) {
            await clickElement('div[class="caption js-viewport"]')
            await clickElement(`div[data-townid="${city.townID}"]`)

            await clickElement('li[data-option-id="profile"]');
            await awaitLoading();
            await clickElement(`a[href='${city.cityURL}']`);
            await clickElement('div[id="info"]');
            await awaitLoading();
            await clickElement(`a[href='${city.islandURL}']`);
            await clickElement('div[id="island_info"]');
            await awaitLoading();

            for (const farmingVillage of city.farmingVillages) {
                let allVillages = document.querySelectorAll('a');
                let village = Array.from(allVillages).find(v => v.textContent.trim() === farmingVillage);

                if (village) {
                    village.click();
                    await awaitLoading();
                }

                await clickElement('div[class="btn_claim_resources button button_new"]');
                await clickElement('div[class="btn_wnd close"]');
            }

            await clickElement('div[class="btn_close_all_windows"]');
        }
        await clickElement('div[class="caption js-viewport"]')

    }

    function startFarmingLoop() {
        if (intervalId) {
            console.log("Farming loop is already running.");
            return; // If the loop is already running, do nothing
        }

        console.log("Starting the farming loop...");
        performClicks().then(() => {
            const nextFarmingTime = calculateNextFarming();
            chrome.storage.sync.set({ nextExecution: nextFarmingTime });
            intervalId = setInterval(performClicks, FARMING_DELAY); // Start the loop
        });
    }

    // Listen for messages to stop the interval, trigger manual farming, or restart the loop
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "updateDelay") {
            console.log("Update delay to " + message.delay * 1000);
            click_delay = message.delay * 1000;

        }

        if (message.action === "resetTimer") {
            console.log("Manual farming triggered");
            if (intervalId) {
                clearInterval(intervalId); // Clear the farming loop
                intervalId = undefined; // Reset the intervalId
                window.grepolisAutomationRunning = false; // Reset the flag
                chrome.storage.sync.set({ nextExecution: 0 });
                console.log("Farming loop disabled.");
            }

            // Trigger farming immediately
            performClicks();

            // Restart the farming loop if it's not already running
            if (!intervalId) {
                startFarmingLoop(); // This will restart the loop
            }
            else{

            }
        }

        if (message.action === "disableFarmingLoop") {
            console.log("Disabling farming loop...");
            if (intervalId) {
                clearInterval(intervalId); // Clear the farming loop
                intervalId = undefined; // Reset the intervalId
                window.grepolisAutomationRunning = false; // Reset the flag
                chrome.storage.sync.set({ nextExecution: 0 });
                console.log("Farming loop disabled.");
            } else {
                console.log("No farming loop was running.");
            }
        }
    });

    // Execute the click sequence and start the loop immediately on the first run
        startFarmingLoop();

    console.log("Content script successfully injected.");
})();