(function() {

    const FARMING_DELAY = 601000;
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
        } else {
            console.log(`Element not found for selector: ${querySelector}`);
        }
    }

    async function performClicks() {
        console.log('Farming at', (new Date()).toTimeString().split(' ')[0]);
        const nextFarmingTime = calculateNextFarming();
        chrome.storage.sync.set({ nextExecution: nextFarmingTime });
        clickElement('div[class="caption js-viewport"]')
        await new Promise(resolve => setTimeout(resolve, 1000));

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
                    cityName: "PadoPolis",
                    townID:"4786",
                    cityURL: "#eyJpZCI6NDc4NiwiaXgiOjU1OCwiaXkiOjUwMCwidHAiOiJ0b3duIiwibmFtZSI6IlBhZG9Qb2xpcyJ9",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MDQ5NCwiaXgiOjU1OCwiaXkiOjUwMCwicmVzIjoiU2kiLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Aekos",
                        "Dounosgav",
                        "Hydradougav",
                        "Draiththospsi",
                        "Rhokykos",
                        "Dougi"
                    ]
                },
                {
                    cityName: "PadoPolis II",
                    townID:"6027",
                    cityURL: "#eyJpZCI6NjAyNywiaXgiOjU1OCwiaXkiOjUwNywidHAiOiJ0b3duIiwibmFtZSI6IlBhZG9Qb2xpcyBJSSJ9",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MDQ5NSwiaXgiOjU1OCwiaXkiOjUwNywicmVzIjoiV3MiLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Dradourospsi",
                        "Garos",
                        "Gavgav",
                        "Hystridrahy",
                        "Psikynos",
                        "Striithgavthos"
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
                        "Rhodradougav"
                    ]
                }
            ];
        }

        for (const city of villages) {
            clickElement('div[class="caption js-viewport"]')
            clickElement(`div[data-townid="${city.townID}"]`)

            clickElement('li[data-option-id="profile"]');
            await awaitLoading();
            clickElement(`a[href='${city.cityURL}']`);
            clickElement('div[id="info"]');
            await awaitLoading();
            clickElement(`a[href='${city.islandURL}']`);
            clickElement('div[id="island_info"]');
            await awaitLoading();

            for (const farmingVillage of city.farmingVillages) {
                let allVillages = document.querySelectorAll('a');
                let village = Array.from(allVillages).find(v => v.textContent.trim() === farmingVillage);

                if (village) {
                    village.click();
                    await awaitLoading();
                }

                clickElement('div[class="btn_claim_resources button button_new"]');
                clickElement('div[class="btn_wnd close"]');
            }

            clickElement('div[class="btn_close_all_windows"]');
        }
        clickElement('div[class="caption js-viewport"]')

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

    // Execute the click sequence and start the loop immediately on the first run
    startFarmingLoop();

    // Listen for messages to stop the interval, trigger manual farming, or restart the loop
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "stopAutomation" && intervalId) {
            clearInterval(intervalId); // Clear the interval
            intervalId = undefined; // Reset the intervalId
            window.grepolisAutomationRunning = false; // Reset the flag
            console.log("Click automation stopped.");
        }

        if (message.action === "startFarmingNow") {
            console.log("Manual farming triggered");

            // Trigger farming immediately
            performClicks();

            // Restart the farming loop if it's not already running
            if (!intervalId) {
                startFarmingLoop(); // This will restart the loop
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

    console.log("Content script successfully injected.");
})();