document.addEventListener('DOMContentLoaded', () => {
    const countdownElement = document.getElementById('countdown');
    const delaySlider = document.getElementById('delaySlider');
    const delayValue = document.getElementById('delayValue');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const hackElement = document.getElementById('hackValue');
    const pierceElement = document.getElementById('pierceValue');
    const distanceElement = document.getElementById('distanceValue');
    const autoSyncCheckbox = document.getElementById('autoSyncCheckbox');

    // Retrieve the saved delay value and set it to the slider and display text
    chrome.storage.sync.get(['delayValue'], (result) => {
        if (result.delayValue !== undefined) {
            delaySlider.value = result.delayValue;
            delayValue.textContent = result.delayValue + ' s';
        } else {
            delayValue.textContent = delaySlider.value + ' s'; // Default to current slider value
        }
    });

    chrome.storage.sync.get(['autoSyncEnabled'], (result) => {
        if (result.autoSyncEnabled !== undefined) {
            autoSyncCheckbox.checked = result.autoSyncEnabled;
        } else {
            autoSyncCheckbox.checked = true; // Default to checked if no value is stored
        }
    });

    delaySlider.oninput = function() {
        delayValue.textContent = this.value + ' s';
    };

    delaySlider.addEventListener('change', () => {
        const delay = delaySlider.value;

        chrome.storage.sync.set({ delayValue: delay }, () => {
            console.log(`Delay set to ${delay} seconds`);
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "updateDelay",
                    delay: parseFloat(delay)
                });
            }
        });
    });

    calculateBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "calculateDef" });
            }
        });
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "calculationComplete") {
            chrome.storage.sync.get(['DAIResults'], (result) => {
                if (result.DAIResults) {
                    hackElement.textContent = result.DAIResults.hackDefense?.toString() || "N/A";
                    pierceElement.textContent = result.DAIResults.pierceDefense?.toString() || "N/A";
                    distanceElement.textContent = result.DAIResults.distanceDefense?.toString() || "N/A";
                } else {
                    console.log("DAI results not found or empty.");
                }
            });
        }
    });

    resetTimerBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "resetTimer" });
            }
        });
    });

    disableLoopBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "disableFarmingLoop" });
            }
        });
    });

    autoSyncCheckbox.addEventListener('change', () => {
        const isChecked = autoSyncCheckbox.checked;

        chrome.storage.sync.set({ autoSyncEnabled: isChecked }, () => {
            console.log(`Auto Sync set to ${isChecked}`);
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "autoSync", value: isChecked });
            }
        });
    });

    function updateCountdown() {
        chrome.storage.sync.get(['nextExecution'], (result) => {
            const nextExecution = new Date(result.nextExecution);
            const currentTime = new Date().getTime();
            const timeRemaining = nextExecution - currentTime;

            if (result.nextExecution === 0) {
                countdownElement.textContent = "Timer stopped";
            } else if (timeRemaining > 0) {
                const minutes = Math.floor(timeRemaining / 60000);
                const seconds = Math.floor((timeRemaining % 60000) / 1000);
                countdownElement.textContent = `${minutes}m ${seconds}s until next farming`;
            } else {
                countdownElement.textContent = "Running soon...";
            }
        });
    }
    setInterval(updateCountdown, 1000);

    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

});
