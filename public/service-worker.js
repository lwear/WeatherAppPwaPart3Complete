"use strict"; // forces all errors, helps you write cleaner code

// files to cache for offline use
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/client.js',
  '/scripts/luxon-1.11.4.js',
  '/style.css',
  '/manifest.json',
  '/images/favicon.ico',
  '/images/add.svg',
  '/images/clear-day.svg',
  '/images/clear-night.svg',
  '/images/cloudy.svg',
  '/images/fog.svg',
  '/images/hail.svg',
  '/images/install.svg',
  '/images/partly-cloudy-day.svg',
  '/images/partly-cloudy-night.svg',
  '/images/rain.svg',
  '/images/refresh.svg',
  '/images/sleet.svg',
  '/images/snow.svg',
  '/images/thunderstorm.svg',
  '/images/tornado.svg',
  '/images/wind.svg',
];
///scripts/install.js',
/* Providing a cache name, allows us to version files so we 
 * can easily update some files w/o affecting others. Change
 * the cache name any tine any of the cached files have changed.
 */
const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

/* Adds an install event to the page that caches offline resources */
self.addEventListener("install", evt => {
  console.log ("[service worker] install");
  
  // precache static resources
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[Service Worker] Precaching offline page");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* Once your service worker is ready to control clients and handle
 * functional events like push and sync, you'll get an activate event 
 */
self.addEventListener('activate', (evt) => {
  console.log('[Service Worker] Activate');
  
  // remove previously cached files from disk
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
      
        if (key !== CACHE_NAME  &&  key !== DATA_CACHE_NAME){
          console.log('[Service worker] Removing old cache', key);
          return caches.delete(key); 
        }
      }));
    })
  );
  
  // start controlling all loaded clients w/o reloading them
  self.clients.claim();
});

/* handle fetch events by looking to the network first
 * and then the cache
 */
self.addEventListener('fetch', (evt) => {
  console.log('[Service Worker] Fetch', evt.request.url);
  if (evt.request.url.includes("/forecast/")) {
     console.log("[Service Worker] Fetch (data)", evt.request.url);
     evt.respondWith(
       caches.open(DATA_CACHE_NAME).then(cache => {
         return fetch(evt.request)
           .then (response => {
             //if the response was good, clone it and store it in cache
             if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
             }
             return response;
         })
         .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
         });
       })
     );
    return;
  } // if
  
  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })  
  );
});



