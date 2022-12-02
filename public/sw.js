const version = 3;

// LIFECYLE
self.addEventListener('install', event => { 
    console.log(`Version ${version} installed`); 
});
  
self.addEventListener('activate', event => { 
    console.log('activated'); 
});


//********************************************************************/
// LISTENERS
   
self.addEventListener('message', event => {
  let data = event.data; 
  let clientId = event.source.id;
    
  if ('forOne' in data) { 
      const {color, name, id} = data.forOne
      sendMessage(
          {color, name, id, clientId},
          clientId
      );
  }

  if ('forAll' in data) { 
      const {color, name} = data.forAll
      sendMessage({color, name});
  }
});

self.addEventListener('push', e => {
  const data = e.data.json();
  console.log({data})
  console.log(data)
  console.log('Notification Received');
  self.registration.showNotification(data.title, {
      body: data.message,
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Archlinux-icon-crystal-64.svg/1024px-Archlinux-icon-crystal-64.svg.png'
  });
});


//********************************************************************/
// UTILS
const sendMessage = async (msg, clientId) => {
  let allClients = [];

  if (clientId) {
    let client = await clients.get(clientId);
    allClients.push(client);
  } else {
    allClients = await clients.matchAll({ includeUncontrolled: true });
  }

  return Promise.all(
    allClients.map((client) => {
      // console.log('postMessage', msg, 'to', client.id);
      return client.postMessage(msg);
    })
  );
};

