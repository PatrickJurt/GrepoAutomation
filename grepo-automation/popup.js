document.addEventListener('DOMContentLoaded', () => {
    const countdownElement = document.getElementById('countdown');
    const farmingInterval = 300500; // 5 minutes interval in milliseconds

    // Function to calculate and update the countdown
    function updateCountdown() {
        chrome.storage.sync.get(['nextExecution'], (result) => {
            const nextExecution = new Date(result.nextExecution);

            if (nextExecution) {
                const currentTime = new Date().getTime(); // Get the current time in milliseconds
                const timeRemaining = nextExecution - currentTime; // Calculate the remaining time

                if (timeRemaining > 0) {
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
