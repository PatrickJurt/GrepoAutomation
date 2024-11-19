(function () {

    return;

    function awaitLoading(){
        return new Promise((resolve) => {
            const checkExistence = setInterval(() => {
                const loader = document.getElementById('ajax_loader');
                if (!loader || loader.style.visibility === 'hidden'){
                    resolve();
                }
            }, 100);
        });
    }

    function getCityName(){
        const town = document.querySelector('.town_name');
        return town ? town.textContent.trim() : 'Town name not found.';
    }

    function getEndTimestamp(restTime){
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

    function getJSONfromStorage(storagePlace){
        const storageItem = localStorage.getItem(storagePlace);
        if (storageItem){
            try {
                return JSON.parse(storageItem);
            } catch(e){
                console.error(`Error parsing '${storagePlace}' from localStorage:`, e);
                return [];
            }
        } else {
            console.warn(`No ${storagePlace} found in Storage.`);
            return [];
        }
    }

    function saveTimer(entry){
        const instantBuildTimers = getJSONfromStorage('instantBuildTimers');
        const cityName = getCityName();
        let cityEntry = instantBuildTimers.find(entry => entry.cityName === cityName);
        if (!cityEntry){
            console.warn(`City ${cityName} had no element in instantBuildTimers.`);
            cityEntry = {cityName: cityName, timestamp: ''};
            instantBuildTimers.push(cityEntry);
            console.warn('cityEntry now:', cityEntry);
        }

        if (!entry){
            cityEntry.timestamp = 'Empty Queue';
        }else{
            const timerElement = entry.querySelector('span.countdown');
            if (timerElement){
                if (cityEntry) {
                    cityEntry.timestamp = getEndTimestamp(timerElement.textContent);
                }
            }else{
                console.error('No timer element found');
                cityEntry.timestamp = 'Empty Queue';
            }
        }
        localStorage.setItem('instantBuildTimers', JSON.stringify(instantBuildTimers));
    }

    function getBuildingQueue(){
        const queue = document.querySelector('.ui_various_orders');
        if (queue){
            if (!queue.classList.contains('empty_queue')){
                return [...queue.children].filter(div => !div.classList.contains('empty_slot'));
            }
        }else{
            console.log('No queue', queue)
        }
    }

    function instantBuild(entry){
        const freeFinish = entry.querySelector('div.type_free');
        if (freeFinish){
            freeFinish.querySelector('div.caption').click();
            return true;
        }
        return false;
    }

    function checkFirstQueueItem(){
        const buildingQueue = getBuildingQueue()
        if(buildingQueue.length > 0){
            let i = 0;
            while(true){
                if(instantBuild(buildingQueue[i])){
                    if (buildingQueue.length > i + 1){
                        i++;
                    }else{
                        saveTimer();
                        break;
                    }
                }else{
                    saveTimer(buildingQueue[i]);
                    break;
                }
            }
        }else{
            saveTimer();
        }
    }

    function checkLastQueueItem(){
        const buildingQueue = getBuildingQueue()
        if (buildingQueue.length > 0){
            const latestEntry = buildingQueue[buildingQueue.length - 1];
            if(!instantBuild(latestEntry)){
                if (buildingQueue.length === 1){
                    saveTimer(latestEntry);
                }
            }
        }
    }

    async function clickHandler(event){
        const classes = event.target.classList;
        if (classes.contains('button_build') || classes.contains('build_button')){
            if (!(classes.contains('build_grey') || classes.contains('disabled'))){
                await awaitLoading();
                checkLastQueueItem();
            }
        }
        if (event.target.textContent === 'Gratis'){
            checkFirstQueueItem();
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
        const checkBuildingQueueTimers = () => {
            let instantBuildTimers = getJSONfromStorage('instantBuildTimers');
            if(instantBuildTimers){
                if (instantBuildTimers.length === 0){
                    console.warn(`${instantBuildTimers} is empty.`);
                    checkFirstQueueItem();
                    return;
                }
                instantBuildTimers.forEach((cityTimer) => {
                    if (new Date(cityTimer.timestamp) <= new Date()){
                        goToCity(cityTimer.cityName);
                        checkFirstQueueItem(getBuildingQueue());
                    }
                });
            }else{
            }
        };
        setInterval(checkBuildingQueueTimers, 5000);
    }


    /*
----------------------------------------
            START OF CODE
----------------------------------------
    */
    document.addEventListener('click', (event) => {
        clickHandler(event);
    });
    timerCheck();
})();