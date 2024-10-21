(function() {

    const FARMING_DELAY = 300500;
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

    async function performClicks() {
        const nextFarmingTime = calculateNextFarming();
        chrome.storage.sync.set({ nextExecution: nextFarmingTime });

        const profile = document.querySelector('li[data-option-id="profile"]');
        if (profile) {
            profile.click();
            await awaitLoading();
        } else {
            console.warn("Li with data-option-id 'profile' not found.");
        }

        /*
        Only add the url of one city per island
        To find the city url, go to profile, open dev tools and select the city
        This will highlight an anchor element with a href to copy the url from
        To find the farming island url, go to city info, open dev tools and select the island
        This will highlight an anchor element with a href to copy the url from
        */
        let villages = [];

        const playerInfoText = document.querySelector('#player_info').textContent.trim();
        if (playerInfoText.includes('HansliHornochse')){
            villages = [
                {
                    cityName: "PadoPolis",
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
                }
            ];
        }
        if(playerInfoText.includes('HugoHornochse')){
            villages = [
                {
                    cityName: "Hoger",
                    cityURL: "#eyJpZCI6NDUxMSwiaXgiOjUyNywiaXkiOjU0OCwidHAiOiJ0b3duIiwibmFtZSI6IkhvZ2VyIn0=",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2NTEzOSwiaXgiOjUyNywiaXkiOjU0OCwicmVzIjoiU2kiLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Ithnosrhota",
                        "Nadou",
                        "Nakokos",
                        "Gathosrosko",
                        "Gakosithko",
                        "Dragi"
                    ]
                }
            ];
        }

        for (const city of villages) {

            let town = document.querySelector(`a[href='${city.cityURL}']`);
            if (town) {
                town.click();
                await awaitLoading();
            } else {
                console.warn(`Link with href of ${city.cityName} (${city.cityURL}) not found.`);
            }

            let info = document.querySelector('div[id="info"]');
            if (info) {
                info.click();
                await awaitLoading();
            } else {
                console.warn("Div with id 'info' not found.");
            }

            let island = document.querySelector(`a[href='${city.islandURL}']`);
            if (island) {
                island.click();
                await awaitLoading();
            } else {
                console.warn(`Link with href '${city.islandURL}' not found.`);
            }

            let islandInfo = document.querySelector('div[id="island_info"]');
            if (islandInfo) {
                islandInfo.click();
                await awaitLoading();
            } else {
                console.warn("Div with id 'island_info' not found.");
            }

            for (const farmingVillage of city.farmingVillages) {
                let allVillages = document.querySelectorAll('a');
                let village = Array.from(allVillages).find(v => v.textContent.trim() === farmingVillage);

                if (village) {
                    village.click();
                    await awaitLoading();
                } else {
                    console.warn(`Anchor with inner text '${farmingVillage}' not found.`);
                }

                let claimRessources = document.querySelector('div[class="btn_claim_resources button button_new"]');
                if (claimRessources) {
                    claimRessources.click();
                    await awaitLoading();
                } else {
                    console.warn("Div with class 'btn_claim_resources' not found.");
                }

                let closeVillage = document.querySelector('div[class="btn_wnd close"]');
                if (closeVillage) {
                    closeVillage.click();
                    await awaitLoading();
                } else {
                    console.warn("Div with class 'btn_wnd close' not found.");
                }
            }

            let closeIsland = document.querySelector('button[class="icon_right icon_type_speed ui-dialog-titlebar-close"]');
            if (closeIsland) {
                closeIsland.click();
            } else {
                console.warn("Button to close island not found.");
            }

            let closeIslandInfo = document.querySelector('button[class="icon_right icon_type_speed ui-dialog-titlebar-close"]');
            if (closeIslandInfo) {
                closeIslandInfo.click();
            } else {
                console.warn("Button to close islandInfo not found.");
            }

            let closeCity = document.querySelector('button[class="icon_right icon_type_speed ui-dialog-titlebar-close"]');
            if (closeCity) {
                closeCity.click();
            } else {
                console.warn("Button to close Profile not found.");
            }
        }
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