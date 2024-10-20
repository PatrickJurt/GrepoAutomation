(function () {

    

    function awaitLoading(){
        return new Promise((resolve) => {
            const checkExistence = setInterval(() => {
                const loader = document.getElementById('ajax_loader');
                if (loader){
                    if (loader.style.visibility === 'hidden'){
                        clearInterval(checkExistence);
                        console.log('Awaited Loading')
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
        calculatedTime.setSeconds(calculatedTime.getSeconds() - 5);

        return calculatedTime.toISOString();
    }

    function addBuildingIntoAutomationQueue(restTime){
        console.log('addBuildingIntoAutomationQueue', restTime);
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
            console.log('Updated buildingFinishTimer in local Storage:', buildingFinishTimer);

        } catch (e) {
            console.error("Error updating 'buildingFinishTimer':", e);
        }
    }

    async function clickHandler(event){
        const classes = event.target.classList;
        if (classes.contains('button_build') || classes.contains('build_button')){
            if (!(classes.contains('build_grey') || classes.contains('disabled'))){
                await awaitLoading();
                const queue = document.querySelector('.ui_various_orders');
                if (queue){
                    if (!queue.classList.contains('empty_queue')){
                        const activeEntries = [...queue.children].filter(div => !div.classList.contains('empty_slot'));
                        if (activeEntries.length > 0){
                            const newEntry = activeEntries[activeEntries.length - 1];
                            const freeFinish = newEntry.querySelector('div.type_free');
                            console.log('freeFinish', freeFinish);
                            //Free Finish is available
                            if (freeFinish){
                                freeFinish.querySelector('div.caption').click();
                                console.log('clicked on free finish');
                            //Free Finish is not available
                            }else{
                                const timer = newEntry.querySelector('span.countdown');
                                if (timer){
                                    addBuildingIntoAutomationQueue(timer.textContent);
                                }else{
                                    console.log('no timer element')
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    document.addEventListener('click', (event) => {
        clickHandler(event);
    })
})();