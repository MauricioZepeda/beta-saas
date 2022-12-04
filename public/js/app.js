(()=>{ 

  // SW ---------------------------------------------------------------------------------------------------- 
  const registerSW = async () => {
    const register = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    }); 
    return register;
  } 
  

  const GetPublicKey = async()=>{
    const response = await fetch('/publickey');
    const publickey = await response.json();       
    return publickey;
  }

  // PUSH --------------------------------------------------------------------------------------------------
  const getSubscriptionPush = async (register) => {  
    const getPublicKey = await GetPublicKey(); 

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(getPublicKey)
    });
    return subscription;  
  };
  
  const registerSubscriptionPush = async (subscription) => {  
    await fetch("/subscription", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "Content-Type": "application/json"
      }
    }); 
  };
 
  const urlBase64ToUint8Array = base64String => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  

  // SIMPLE ----------------------------------------------------------------------------------------------- 
  const configureSimpleMessage = async() => { 
    //listen for the latest sw
    navigator.serviceWorker.addEventListener('controllerchange', async () => await navigator.serviceWorker.controller );
    //listen for messages
    navigator.serviceWorker.addEventListener('message', onMessage);
  } 

  const onMessage = ({ data }) => { 
    //got a message from the service worker
    console.log('Web page receiving => ', data);
  }

  const sendMessage = msg => {  
    //send some structured-cloneable data from the webpage to the sw
    if (navigator.serviceWorker.controller) { 
      navigator.serviceWorker.controller.postMessage(msg);
    }
  }  


  // HANDLERS -----------------------------------------------------------------------------------------------  
  const addHandlerPush = () => {
    document.getElementById('colorForm').addEventListener('submit', event => {  
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
    });
  }

  const addHandlerSimple = () => { 
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
  }


  const addBoton = async() => {
    const key = await GetPublicKey();
    var tag = document.createElement("button");
    var text = document.createTextNode(key);
    tag.appendChild(text);
    var element = document.querySelector('body');
    element.appendChild(tag);
  }

  const setHandlersDOM = () => {
    addHandlerSimple();
    addHandlerPush();
    
    addBoton();
    
  }  


  // APP STARTS ---------------------------------------------------------------------------------------------- 
  const loadPage = () => {
    registerSW() 
    .then(getSubscriptionPush)
    .then(registerSubscriptionPush)
    .then(configureSimpleMessage)
    .then(setHandlersDOM) 
    .catch(console.log);  
  }
    
  ('serviceWorker' in navigator) ? loadPage() : console.error('Service workers are not supported.'); 
})();