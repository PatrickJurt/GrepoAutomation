document.addEventListener('DOMContentLoaded', () => {
    const countdownElement = document.getElementById('countdown');
    const farmNowBtn = document.getElementById('farmNowBtn');

    farmNowBtn.addEventListener('click', () => {
        // This makes it only work if the grepolis tab is active. To control it from a different tab, use background.js as a mediator
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "startFarmingNow" });
            }
        });
    });

    disableLoopBtn.addEventListener('click', () => {
        //same as above
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "disableFarmingLoop" });
            }
        });
    });


    function updateCountdown() {
        chrome.storage.sync.get(['nextExecution'], (result) => {
            const nextExecution = new Date(result.nextExecution);

            if (nextExecution) {
                const currentTime = new Date().getTime(); // Get the current time in milliseconds
                const timeRemaining = nextExecution - currentTime; // Calculate the remaining time

                if(result.nextExecution === 0){
                    countdownElement.textContent = "Timer stopped";
                }

                else if (timeRemaining > 0) {
                    const minutes = Math.floor(timeRemaining / 60000); // Convert to minutes
                    const seconds = Math.floor((timeRemaining % 60000) / 1000); // Convert remaining milliseconds to seconds

                    countdownElement.textContent = `${minutes}m ${seconds}s until next farming`;

                } else {
                    countdownElement.textContent = "Running soon..."; // If time has passed or very near execution
                }
            } else {
                countdownElement.textContent = "Next farming time not set.";
            }
        });
    }

    // Update countdown every second
    setInterval(updateCountdown, 1000);
});
