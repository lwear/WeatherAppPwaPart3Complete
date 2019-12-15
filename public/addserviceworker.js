// if this browser supports service workers
if ('serviceWorker' in navigator ) {
   // add an onload event to the page
   window.addEventListener('load', () => {
    
     // load the service worker
     navigator.serviceWorker.register('service-worker.js')
       .then((reg) => {
         // confirm the service worker loaded
         console.log('Service worker registered.', reg);
     });
     
   });  
}