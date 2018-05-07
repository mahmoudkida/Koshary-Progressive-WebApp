const staticCacheName = 'kohsary-static-v1';
const contentImgsCache = 'kohsary-content-imgs';
const mapCache = 'koshary-maps';
var allCaches = [
  staticCacheName,
  contentImgsCache,
    mapCache
];
//files names
const cssFiles = ['base', 'tablet', 'desktop'];
const dataFiles = ['restaurants'];
const restaurantsImages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const otherImages = ['placeholder-image.jpg', 'logo-bg.png', 'logo-horizontal.png', 'logo-horizontal_nnfx9z_c_scale,w_200.png', 'logo-horizontal_nnfx9z_c_scale,w_521.png', 'logo-icon.png', 'tools-and-utensils.svg'];
const jsFiles = ['index', 'restaurant_info', 'vendor'];
const htmlFiles = ['index', 'restaurant'];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
				'',
				...htmlFiles.map(fileName => `${fileName}.html`),
				...cssFiles.map(fileName => `css/${fileName}.css`),
//				//...dataFiles.map( fileName => `data/${fileName}.json`),
				//...imgFiles.map(fileName => `img/${fileName}.jpg`),
				...jsFiles.map(fileName => `js/${fileName}.js`)
			]);
        })
    );
    //cahcing iamges on first run
    event.waitUntil(
        caches.open(contentImgsCache).then(function (cache) {
            return cache.addAll([
				'favicon.ico',
				...restaurantsImages.map(fileName => `img/${fileName}.jpg`),
				...otherImages.map(fileName => `img/${fileName}`),

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
                        !allCaches.includes(cacheName);
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});



self.addEventListener('fetch', function (event) {
    if (event.request.clone().method == "GET") {
        var requestUrl = new URL(event.request.url);

        if (requestUrl.origin === location.origin && requestUrl.pathname === '/') {
            event.respondWith(caches.match('index.html'));
            return;
        }
        if (requestUrl.origin === location.origin && requestUrl.pathname.includes('restaurant.html')) {
            event.respondWith(caches.match('restaurant.html'));
            return;
        } else if (requestUrl.origin === location.origin && requestUrl.pathname.includes('img/')) {
            event.respondWith(servePhoto(event.request));
            return;
        } else if (requestUrl.pathname.includes('maps')) {
            event.respondWith(serveMapCache(event.request));
            return;
        } else {
            event.respondWith(
                caches.match(event.request).then(function (response) {
                    return response || fetch(event.request);
                })
            );
            return;
        }
    } else { //other than get - this is for ofline post
         fetch(event.request.clone()).catch(function () {
            // If it doesn't work, post a failure message to the client
            self.clients.get(event.clientId).then(function (client) {
                client.postMessage({
                    message: "Post unsuccessful.",
                    request: event.request.clone() // A string we instantiated earlier
                });
                // Respond with the page that the request originated from
                return;
            });

        });
    }
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

function serveMapCache(request) {
    var storageUrl = request.url;

    return caches.open(mapCache).then(function (cache) {
        return cache.match(storageUrl).then(function (response) {
            if (response) return response;

            return fetch(request).then(function (networkResponse) {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}

function serveCachedItem(request) {
    var storageUrl = request.url;
    return caches.open(staticCacheName).then(function (cache) {
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
