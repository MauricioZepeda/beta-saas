(()=>{

  let SW = null;

  const registerSW = () => {
    // register a service worker
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
          SW =  registration.installing ||
                registration.waiting    ||
                registration.active; 
      },
      (error) => {
        console.log('Service worker registration failed:', error);
      }
    );

    //listen for the latest sw
    navigator.serviceWorker.addEventListener('controllerchange', async () => {
      SW = navigator.serviceWorker.controller;
    });

    //listen for messages
    navigator.serviceWorker.addEventListener('message', onMessage);
  }


  const onMessage = ({ data }) => { 
    //got a message from the service worker
    console.log('Web page receiving => ', data);
  }

  const sendMessage = (msg) => {  
    //send some structured-cloneable data from the webpage to the sw
    if (navigator.serviceWorker.controller) { 
      navigator.serviceWorker.controller.postMessage(msg);
    }
  }


  const handlerSave = (event) => {  
      event.preventDefault();

      let name = document.getElementById('name');
      let color = document.getElementById('color');
      let strName = name.value.trim();
      let strColor = color.value.trim();

      if (strName && strColor) {
        let person = {
          id: Date.now(),
          name: strName,
          color: strColor,
        };
        console.log('Enviando...', person);
        
        //send the data to the service worker 
        
        // to all
        sendMessage({ forAll: person });

        // only for the tab
        //sendMessage({ forOne: person });
      }
     
  }


   
  

  if ('serviceWorker' in navigator) {
    registerSW();
    document
      .getElementById('colorForm')
      .addEventListener('submit', handlerSave);  
  } else {
    console.error('Service workers are not supported.');
  }

})();