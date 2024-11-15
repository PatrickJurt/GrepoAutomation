(function() {

    let hackDefense = 0;
    let pierceDefense = 0;
    let distanceDefense = 0;

    const units = ['div[data-type="sword"]',
    'div[data-type="archer"]',
    'div[data-type="hoplite"]',
    'div[data-type="rider"]',
    'div[data-type="chariot"]',
    'div[data-type="pegasus"]',
    'div[data-type="godsent"]'];

    let swordCount = 0;
    let archerCount = 0;
    let hopliteCount = 0;
    let riderCount = 0;
    let chariotCount = 0;
    let pegasusCount = 0;
    let godsentCount = 0;

    function getUnits(){
        units.forEach(unit => {
            const unitDiv = document.querySelector(unit);

            if (unitDiv) {
                const valueDiv = unitDiv.querySelector('.value');
                if (valueDiv) {
                    const numberValue = parseInt(valueDiv.textContent.trim(), 10);
                    switch (unit) {
                        case 'div[data-type="sword"]': swordCount = numberValue; break;
                        case 'div[data-type="archer"]': archerCount = numberValue; break;
                        case 'div[data-type="hoplite"]': hopliteCount = numberValue; break;
                        case 'div[data-type="rider"]': riderCount = numberValue; break;
                        case 'div[data-type="chariot"]': chariotCount = numberValue; break;
                        case 'div[data-type="pegasus"]': pegasusCount = numberValue; break;
                        case 'div[data-type="godsent"]': godsentCount = numberValue; break;
                    }
                } else {
                    console.log(`No value div found for ${unit}`);
                }
            } else {
                console.log(`No div found for ${unit}`);
            }
        });
    }

    function calculateDef() {
        getUnits();

        hackDefense = (swordCount * 14) + (archerCount * 7) + (hopliteCount * 18) + (riderCount * 18) + (chariotCount * 76) + (pegasusCount * 750) + (godsentCount * 40)
        pierceDefense = (swordCount * 8) + (archerCount * 25) + (hopliteCount * 12) + (riderCount * 1) + (chariotCount * 16) + (pegasusCount * 275) + (godsentCount * 40)
        distanceDefense = (swordCount * 30) + (archerCount * 13) + (hopliteCount * 7) + (riderCount * 24) + (chariotCount * 56) + (pegasusCount * 275) + (godsentCount * 40)

        chrome.storage.sync.set({ DAIResults: { hackDefense: hackDefense, pierceDefense: pierceDefense, distanceDefense:distanceDefense } }, () => {
            chrome.runtime.sendMessage({ action: "calculationComplete" });
        });


    }

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "calculateDef") {
            console.log("Calculating defense...");
            calculateDef();
        }
    });

})();
