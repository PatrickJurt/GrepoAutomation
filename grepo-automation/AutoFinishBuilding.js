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
        calculatedTime.setSeconds(calculatedTime.getSeconds() + 5);

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

            const newEntry = { cityName: getCityName(), timestamp: getTimestamp(restTime) };
            buildingFinishTimer.push(newEntry);
            localStorage.setItem('buildingFinishTimer', JSON.stringify(buildingFinishTimer));

        } catch (e) {
            console.error("Error updating 'buildingFinishTimer':", e);
        }
    }

    function checkQueueItem(activeEntries, indexType){
        const entry = activeEntries[indexType === 'last' ? activeEntries.length - 1 : 0];
        
        const freeFinish = entry.querySelector('div.type_free');
        if (freeFinish){
            freeFinish.querySelector('div.caption').click();
        }else{
            if (indexType === 'last'){
                const timer = entry.querySelector('span.countdown');
                if (timer){
                    addBuildingIntoAutomationQueue(timer.textContent);
                }else{
                    console.error('no timer element')
                }
            }else{
                console.error('Item was not ready to finish, something went wrong.')
            }
        }
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
                checkQueueItem(getQueueEntries(), 'last');
            }
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
                    checkQueueItem(getQueueEntries(), 'first');
                    allTimers = allTimers.filter(entry => entry !== buildingEntry);
                }
            });
            localStorage.setItem('buildingFinishTimer', JSON.stringify(allTimers));
        };
        setInterval(checkTimers, 10000);
    }

    document.addEventListener('click', (event) => {
        clickHandler(event);
    });

    timerCheck();

})();