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

    async function clickHandler(event){
        const classes = event.target.classList;
        console.log(classes)
        if (classes.contains('button_build') || classes.contains('build_button')){
            await awaitLoading();
            console.log('done waiting');
            const queue = document.querySelector('.ui_various_orders');
            console.log('queue', queue);
            if (queue){
                if (!queue.classList.contains('empty_queue')){
                    const activeQueues = [...queue.children].filter(div => !div.classList.contains('empty_slot'));
                    console.log('activeQueues', activeQueues)
                    if (activeQueues.length > 0){
                        const free = activeQueues[activeQueues.length - 1].querySelector('div.type_free');
                        console.log('free', free);
                        //Free Finish is available
                        if (free){
                            free.querySelector('div.caption').click();
                            console.log('clicked');
                        //Free Finish is not available
                        }else{
                            
                        }
                        
                    }
                }else{
                    console.log('empty queue')
                }
            }

        }
    }

    document.addEventListener('click', (event) => {
        clickHandler(event);
    })
})();