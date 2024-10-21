(function () {

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


    function getCityName(){
        const town = document.querySelector('.town_name');
        if (town){
            return town.textContent.trim();
        }
    }

    function getTimestamp(restTime){
        const [hours, minutes, seconds] = restTime.split(':').map(Number);
        const currentTime = new Date();
        const calculatedTime = new Date(currentTime);

        calculatedTime.setHours(currentTime.getHours() + hours);
        calculatedTime.setMinutes(currentTime.getMinutes() + minutes);
        calculatedTime.setSeconds(currentTime.getSeconds() + seconds);
        calculatedTime.setMinutes(calculatedTime.getMinutes() - 5);
        calculatedTime.setSeconds(calculatedTime.getSeconds() + 1);

        return calculatedTime.toISOString();
    }

    function addBuildingIntoAutomationQueue(restTime){
        try{
            let buildingFinishTimer = localStorage.getItem('buildingFinishTimer');
            if (buildingFinishTimer){
                try {
                    buildingFinishTimer = JSON.parse(buildingFinishTimer);
                    if (!Array.isArray(buildingFinishTimer)){
                        throw new Error('Parsed value is not an array');
                    }
                } catch(e){
                    console.error("Error parsing 'buildingFinishTimer from localStorage:", e)
                    buildingFinishTimer = [];
                }
            } else {
                buildingFinishTimer = [];
            }

            const cityName = getCityName();
            buildingFinishTimer = buildingFinishTimer.filter((entry) => entry.cityName !== cityName)

            const newEntry = { cityName: cityName, timestamp: getTimestamp(restTime) };
            buildingFinishTimer.push(newEntry);
            localStorage.setItem('buildingFinishTimer', JSON.stringify(buildingFinishTimer));

        } catch (e) {
            console.error("Error updating 'buildingFinishTimer':", e);
        }
    }

    function saveTimer(entry){
        const timer = entry.querySelector('span.countdown');
        if (timer){
            addBuildingIntoAutomationQueue(timer.textContent);
        }else{
            console.error('no timer element');
        }
    }

    function checkFreeFinish(entry){
        const freeFinish = entry.querySelector('div.type_free');
        if (freeFinish){
            freeFinish.querySelector('div.caption').click();
            return true;
        }
        return false;
    }

    function checkFirstQueueItem(activeEntries){
        let i = 0;
        if(checkFreeFinish(activeEntries[i])){
            //First item finished, check next item, add to Q
            i++;
            while(activeEntries[i]){
                if(checkFreeFinish(activeEntries[i])){
                    i++;
                } else{
                    saveTimer(activeEntries[i]);
                    break;
                }
            }
            //First item isn't finishable, timer in storage doesn't work, get new one
        }else{
            checkFirstQueueItem(getQueueEntries());
        }
    }

    function checkLastQueueItem(activeEntries){
        const entry = activeEntries[activeEntries.length - 1];
        if(checkFreeFinish(entry)){
            //New item finished, nothing to do
        }else{
            //New item not able to finish, if it's the only item add it to Q, otherwise we only care about the first one in the Q
            if (activeEntries.length === 1){
                saveTimer(entry);
            }
        };
    }

    function getQueueEntries(){
        const queue = document.querySelector('.ui_various_orders');
        if (queue){
            if (!queue.classList.contains('empty_queue')){
                const activeEntries = [...queue.children].filter(div => !div.classList.contains('empty_slot'));
                if (activeEntries.length > 0){
                    return activeEntries;
                }
            }
        }
    }

    async function clickHandler(event){
        const classes = event.target.classList;
        if (classes.contains('button_build') || classes.contains('build_button')){
            if (!(classes.contains('build_grey') || classes.contains('disabled'))){
                await awaitLoading();
                checkLastQueueItem(getQueueEntries());
            }
        }

        if (event.target.textContent === 'Gratis'){
            checkFirstQueueItem(getQueueEntries());
        }
    }

    async function goToCity(cityName){
        let profile = document.querySelector('li[data-option-id="profile"]');
        if (profile) {
            profile.click();
            await awaitLoading();
            const profileWindowTitleSpan = Array.from(document.querySelectorAll('span')).find(element => element.textContent.trim() === 'Spielerprofil');
            const profileWindow = profileWindowTitleSpan.parentElement?.parentElement;
            Array.from(profileWindow.querySelectorAll('a')).find(a => a.textContent.trim() === cityName).click();
            await awaitLoading();
            document.querySelector('#goToTown.context_icon').click();
            await awaitLoading();
            document.querySelector('button[class="icon_right icon_type_speed ui-dialog-titlebar-close"]').click();
            await awaitLoading();
        }
    }
    
    function timerCheck() {
        const checkTimers = () => {
            let allTimers = JSON.parse(localStorage.getItem('buildingFinishTimer'));
            if (!allTimers || allTimers.length === 0) return;
            allTimers.forEach((buildingEntry) => {
                const timestamp = new Date(buildingEntry.timestamp);
                if (timestamp <= new Date()){
                    goToCity(buildingEntry.cityName);
                    allTimers = allTimers.filter(entry => entry !== buildingEntry);
                    localStorage.setItem('buildingFinishTimer', JSON.stringify(allTimers));
                    checkFirstQueueItem(getQueueEntries());
                }
            });
        };
        setInterval(checkTimers, 5000);
    }

    document.addEventListener('click', (event) => {
        clickHandler(event);
    });

    timerCheck();

})();