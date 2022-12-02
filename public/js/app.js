(()=>{
  const PUBLIC_VAPID_KEY =
  "BKMsYj4vmop--h5ygEnlTy1eYsZCSV7-ekvAi4VXew9EGKBvhbHut0in4hNo_1S2U_RddzyWmbW5MaJBbOKTUMY";

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




  const subscription = async () => {
    
    const register = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    });
    
     // SIMPLE ----------------------------------------------------------------
     //listen for the latest sw
     navigator.serviceWorker.addEventListener('controllerchange', async () => {
      SW = navigator.serviceWorker.controller;
    });
    //listen for messages
    navigator.serviceWorker.addEventListener('message', onMessage);
    //------------------------------------------------------------------------


    // FAZT ----------------------------------------------------------------
    // Listen Push Notifications
    console.log("Listening Push Notifications");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });
  
    console.log(subscription);  

    // Send Notification
    await fetch("/subscription", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "Content-Type": "application/json"
      }
    });
 
  };
  

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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




// UI
const form = document.querySelector('#myform');
const message = document.querySelector('#message');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  fetch('/new-message', {
    method: 'POST',
    body: JSON.stringify({message: message.value}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  form.reset();
});
   
  

  if ('serviceWorker' in navigator) {
   //registerSW();
    subscription().catch(err => console.log(err));
    document
      .getElementById('colorForm')
      .addEventListener('submit', handlerSave);  
  } else {
    console.error('Service workers are not supported.');
  }

})();