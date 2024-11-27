(function() {

    let intervalId;
    let syncOffset;

    //delays
    const FARMING_DELAY = 601000;
    let click_delay = 0;

    //flags
    let justSynced = false;
    let recreateInterval = false;
    let firstExecution = true;
    let autoSync = true;

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
            if(querySelector = 'div[class="btn_claim_resources button button_new"]' && autoSync){
                console.log("sync is " + autoSync)
                chrome.storage.sync.set({ nextExecution: syncCooldown() });
            }
        }
    }

    function syncCooldown() {
        const timeElement = document.querySelector('span.pb_bpv_unlock_time');
        if (!timeElement) {
            console.log("Element with class 'pb_bpv_unlock_time' not found.");
            return null;
        }

        const timeText = timeElement.textContent.trim();
        const timeMatch = timeText.match(/^(\d{2}):(\d{2}):(\d{2})$/);
        if (!timeMatch) {
            console.log("Time format is invalid. Expected HH:MM:SS, got:", timeText);
            return null;
        }

        const [, hours, minutes, seconds] = timeMatch.map(Number);
        const milliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
        const currentTimeMillis = Date.now();
        const targetTimeMillis = currentTimeMillis + milliseconds;
        syncOffset = milliseconds;
        justSynced = true;
        recreateInterval = true;

        return targetTimeMillis;
    }

    async function performClicks() {
        console.log('Farming at', (new Date()).toTimeString().split(' ')[0]);
        const nextFarmingTime = calculateNextFarming();
        chrome.storage.sync.set({ nextExecution: nextFarmingTime });
        await clickElement('div[class="caption js-viewport"]')
        await new Promise(resolve => setTimeout(resolve, 500));
        await clickElement('li[data-option-id="profile"]');
        await awaitLoading();
        console.log("look for playerinfo")
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
                },
                {
                    cityName: "Industrie",
                    townID:"1910",
                    cityURL: "#eyJpZCI6MTkxMCwiaXgiOjUyNywiaXkiOjUyNiwidHAiOiJ0b3duIiwibmFtZSI6IkluZHVzdHJpZSJ9",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MjY4MSwiaXgiOjUyNywiaXkiOjUyNiwicmVzIjoiU3ciLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Dradou",
                        "Hythosta",
                        "Kosaestri",
                        "Kosthosta",
                        "Striginos",
                        "Gavkosnos"
                    ]
                },
                {
                    cityName: "Roggeflue",
                    townID:"4314",
                    cityURL: "#eyJpZCI6NDMxNCwiaXgiOjUzOCwiaXkiOjUzOSwidHAiOiJ0b3duIiwibmFtZSI6IlJvZ2dlZmx1ZSJ9",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MjY4MywiaXgiOjUzOCwiaXkiOjUzOSwicmVzIjoiV3MiLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Aeith",
                        "Aekoshy",
                        "Aekydou",
                        "Gata",
                        "Rhonosgikos",
                        "Rosrhokos"
                    ]
                },
                {
                    cityName: "Füürwehrmagazin",
                    townID:"5234",
                    cityURL: "#eyJpZCI6NTIzNCwiaXgiOjU0MCwiaXkiOjU0NCwidHAiOiJ0b3duIiwibmFtZSI6IkZcdTAwZmNcdTAwZmNyd2Vocm1hZ2F6aW4ifQ==",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2NTA3MiwiaXgiOjU0MCwiaXkiOjU0NCwicmVzIjoiSXciLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Douaenaga",
                        "Kospsi",
                        "Kosthos",
                        "Rosith",
                        "Thosthos",
                        "Nosae"
                    ]
                },
                {
                    cityName: "Hirsacker",
                    townID:"5916",
                    cityURL: "#eyJpZCI6NTkxNiwiaXgiOjU0MiwiaXkiOjU1MSwidHAiOiJ0b3duIiwibmFtZSI6IkhpcnNhY2tlciJ9",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2NTA3MywiaXgiOjU0MiwiaXkiOjU1MSwicmVzIjoiSXciLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Giith",
                        "Ithros",
                        "Kostri",
                        "Kyta",
                        "Nosthosnos",
                        "Thosgastriga"
                    ]
                },
                {
                    cityName: "Üsseri Klus",
                    townID:"6642",
                    cityURL: "#eyJpZCI6NjY0MiwiaXgiOjUyOSwiaXkiOjU0OCwidHAiOiJ0b3duIiwibmFtZSI6Ilx1MDBkY3NzZXJpIEtsdXMifQ==",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2NTA0MCwiaXgiOjUyOSwiaXkiOjU0OCwicmVzIjoiSXciLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Gadougavnos",
                        "Gavae",
                        "Gavkospsi",
                        "Hytaga",
                        "Kosgavdourho",
                        "Rosgarho"
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
                },
                {
                    cityName: "Mülifäud",
                    townID:"1528",
                    cityURL: "#eyJpZCI6MTUyOCwiaXgiOjUyNywiaXkiOjUyNiwidHAiOiJ0b3duIiwibmFtZSI6Ik1cdTAwZmNsaWZcdTAwZTR1ZCJ9",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MjY4MSwiaXgiOjUyNywiaXkiOjUyNiwicmVzIjoiU3ciLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Striginos",
                        "Kosaestri",
                        "Hythosta",
                        "Dradou",
                        "Kosthosta",
                        "Gavkosnos"
                    ]
                },
                {
                    cityName: "Chutloch",
                    townID:"2814",
                    cityURL: "#eyJpZCI6MjgxNCwiaXgiOjU0MCwiaXkiOjUzNSwidHAiOiJ0b3duIiwibmFtZSI6IkNodXRsb2NoIn0=",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MjczOCwiaXgiOjU0MCwiaXkiOjUzNSwicmVzIjoiV3MiLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Gistri",
                        "Rosros",
                        "Aedoupsipsi",
                        "Psipsihydou",
                        "Strina",
                        "Kosnosnagi"
                    ]
                },
                {
                    cityName: "Ebni",
                    townID:"3685",
                    cityURL: "#eyJpZCI6MzY4NSwiaXgiOjUzOCwiaXkiOjUzOSwidHAiOiJ0b3duIiwibmFtZSI6IkVibmkifQ==",
                    islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MjY4MywiaXgiOjUzOCwiaXkiOjUzOSwicmVzIjoiV3MiLCJsbmsiOnRydWUsInduIjoiIn0=",
                    farmingVillages: [
                        "Aeith",
                        "Rosrhokos",
                        "Aekoshy",
                        "Aekydou",
                        "Gata",
                        "Rhonosgikos"
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
        if(recreateInterval){
            // if farming villages are not ready yet, create a new delayed interval
            recreateInterval = false;
            startFarmingLoop();
        }

    }

    function startFarmingLoop() {
        if(firstExecution){
            firstExecution = false;
            performClicks();
        }

        console.log("Starting the farming loop...");
            const nextFarmingTime = calculateNextFarming();

            if (justSynced) {
                clearInterval(intervalId);
                intervalId = undefined;

                console.log("created a new interval with sync delay " + syncOffset)
                setTimeout(() => {
                    performClicks().then(() => {
                        chrome.storage.sync.set({ nextExecution: nextFarmingTime });
                        intervalId = setInterval(performClicks, FARMING_DELAY);
                    });
                }, syncOffset);
                justSynced = false;
            } else {
                chrome.storage.sync.set({ nextExecution: nextFarmingTime });
                clearInterval(intervalId);
                intervalId = undefined;
                console.log("created a new interval with usual delay")
                intervalId = setInterval(performClicks, FARMING_DELAY);

            }
    }

    // Listen for messages to stop the interval, trigger manual farming, or restart the loop
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "updateDelay") {
            console.log("Update delay to " + message.delay * 1000);
            click_delay = message.delay * 1000;

        }

        if (message.action === "resetTimer") {
            performClicks();
            console.log("Manual farming triggered");
            if (intervalId) {
                clearInterval(intervalId); // Clear the farming loop
                intervalId = undefined; // Reset the intervalId
                chrome.storage.sync.set({ nextExecution: 0 });
                console.log("Farming loop disabled.");
            }

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

        if (message.action === "autoSync") {
            console.log("toggled autosync");
            autoSync = message.value;
        }

    });

    // Execute the click sequence and start the loop immediately on the first run
        startFarmingLoop();

    console.log("Content script successfully injected.");
})();