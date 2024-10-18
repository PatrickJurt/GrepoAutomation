(function() {
    // Check if automation is already running
    if (window.grepolisAutomationRunning) {
        console.log("Click automation is already running.");
        return; // Exit if already running
    }

    window.grepolisAutomationRunning = true; // Set the flag to true

    // Move the interval declaration outside the if statement
    let intervalId;

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function performClicks() {
        console.log("Starting the farming click sequence...");

        let profile = document.querySelector('li[data-option-id="profile"]');
        console.log("profile");
        if (profile) {
            profile.click();
            await delay(500);
        } else {
            console.log("Li with data-option-id 'profile' not found.");
        }

        /*
        Only add the url of one city per island
        To find the city url, go to profile, open dev tools and select the city
        This will highlight an anchor element with a href to copy the url from
        To find the farming island url, go to city info, open dev tools and select the island
        This will highlight an anchor element with a href to copy the url from
        */
        let villages = [];
        const title = document.querySelector('h3');
        if (title){
            console.log('Running for', title);
            if (title.textContent.trim() === 'HansliHornochse'){
                villages = [
                    {
                        cityName: "HansliHornochse's Stadt",
                        cityURL: "#eyJpZCI6NDc4NiwiaXgiOjU1OCwiaXkiOjUwMCwidHAiOiJ0b3duIiwibmFtZSI6IkhhbnNsaUhvcm5vY2hzZXMgU3RhZHQifQ==",
                        islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2MDQ5NCwiaXgiOjU1OCwiaXkiOjUwMCwicmVzIjoiU2kiLCJsbmsiOnRydWUsInduIjoiIn0=",
                        farmingVillages: [
                            "Aekos",
                            "Dounosgav",
                            "Hydradougav",
                            "Draiththospsi",
                        ]
                    }
                ];
            }else{
                villages = [
                    {
                        cityName: "HugoHornochse's Stadt",
                        cityURL: "#eyJpZCI6NDUxMSwiaXgiOjUyNywiaXkiOjU0OCwidHAiOiJ0b3duIiwibmFtZSI6Ikh1Z29Ib3Jub2Noc2VzIFN0YWR0In0=",
                        islandURL: "#eyJ0cCI6ImlzbGFuZCIsImlkIjo2NTEzOSwiaXgiOjUyNywiaXkiOjU0OCwicmVzIjoiU2kiLCJsbmsiOnRydWUsInduIjoiIn0=",
                        farmingVillages: [
                            "Ithnosrhota",
                            "Nadou",
                            "Nakokos"
                        ]
                    }
                ];
            }
        }

        for (const city of villages) {
            console.log(`Processing city: ${city.cityName}`);

            let town = document.querySelector(`a[href='${city.cityURL}']`);
            console.log("town");
            if (town) {
                town.click();
                await delay(500);
            } else {
                console.log(`Link with href of ${city.cityName} (${city.cityURL}) not found.`);
            }

            let info = document.querySelector('div[id="info"]');
            console.log("info");
            if (info) {
                info.click();
                await delay(500);
            } else {
                console.log("Div with id 'info' not found.");
            }

            let island = document.querySelector(`a[href='${city.islandURL}']`);
            console.log("island");
            if (island) {
                island.click();
                await delay(500);
            } else {
                console.log(`Link with href '${city.islandURL}' not found.`);
            }

            let islandInfo = document.querySelector('div[id="island_info"]');
            console.log("islandInfo");
            if (islandInfo) {
                islandInfo.click();
                await delay(500);
            } else {
                console.log("Div with id 'island_info' not found.");
            }

            for (const farmingVillage of city.farmingVillages) {

                console.log("village");
                let allVillages = document.querySelectorAll('a');

                let village = Array.from(allVillages).find(v => v.textContent.trim() === farmingVillage);

                if (village) {
                    console.log("Clicking on village anchor with text:", village.textContent);
                    village.click();
                    await delay(500);
                } else {
                    console.log(`Anchor with inner text '${farmingVillage}' not found.`);
                }

                let claimRessources = document.querySelector('div[class="btn_claim_resources button button_new"]');
                console.log("claimRessources");
                if (claimRessources) {
                    claimRessources.click();
                    await delay(500);
                } else {
                    console.log("Div with class 'btn_claim_resources' not found.");
                }

                let closeVillage = document.querySelector('div[class="btn_wnd close"]');
                console.log("closeVillage");
                if (closeVillage) {
                    closeVillage.click();
                    await delay(500);
                } else {
                    console.log("Div with class 'btn_claim_resources' not found.");
                }


            }

            let closeIsland = document.querySelector('button[class="icon_right icon_type_speed ui-dialog-titlebar-close"]');
            console.log("closeIsland");
            if (closeIsland) {
                closeIsland.click();
                await delay(500);
            } else {
                console.log("Div with class 'btn_claim_resources' not found.");
            }

            let closeIslandInfo = document.querySelector('button[class="icon_right icon_type_speed ui-dialog-titlebar-close"]');
            console.log("closeTown");
            if (closeIslandInfo) {
                closeIslandInfo.click();
                await delay(500);
            } else {
                console.log("Div with class 'btn_claim_resources' not found.");
            }

            let closeCity = document.querySelector('button[class="icon_right icon_type_speed ui-dialog-titlebar-close"]');
            console.log("closeProfile");
            if (closeCity) {
                closeCity.click();
                await delay(500);
            } else {
                console.log("Div with class 'btn_claim_resources' not found.");
            }
        }
        console.log("Click sequence completed.");
    }

    // Execute the click sequence immediately on the first run
    performClicks().then(() => {
        // Start the interval to perform clicks every 5 minutes (300500 milliseconds)
        intervalId = setInterval(performClicks, 300500); // Repeat every 5 minutes
    });

    // Listen for messages to stop the interval
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "stopAutomation" && intervalId) {
            clearInterval(intervalId); // Clear the interval
            intervalId = undefined; // Reset the intervalId
            window.grepolisAutomationRunning = false; // Reset the flag
            console.log("Click automation stopped.");
        }
    });

    console.log("Content script successfully injected.");
})();
