const staticCacheName = 'kohsary-static-v1';

//files names
const cssFiles = ['styles'];
const dataFiles = ['restaurants'];
const imgFiles = [1,2,3,4,5,6,7,8,9,10];
const jsFiles = ['dbhelper', 'main', 'restaurant_info'];
const htmlFiles = ['index', 'restaurant'];

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(staticCacheName).then(function(cache) {
			return cache.addAll([
				'',
				...htmlFiles.map( fileName => `/${fileName}.html`),
				...cssFiles.map( fileName => `/css/${fileName}.css`),
				...dataFiles.map( fileName => `/data/${fileName}.json`),
				...imgFiles.map( fileName => `/img/${fileName}.jpg`),
				...jsFiles.map( fileName => `/js/${fileName}.js`)
			]);
		})
	);
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('kohsary-') &&
                        cacheName != staticCacheName;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', function (event) {
    var requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        //        if (requestUrl.pathname === '/') {
        //            event.respondWith(caches.match('/skeleton'));
        //            return;
        //        }
        if (requestUrl.pathname.includes('img/')) {
            event.respondWith(servePhoto(event.request));
            return;
        }
    }




    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});


function servePhoto(request) {
    var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

    return caches.open(contentImgsCache).then(function (cache) {
        return cache.match(storageUrl).then(function (response) {
            if (response) return response;

            return fetch(request).then(function (networkResponse) {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}





self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
