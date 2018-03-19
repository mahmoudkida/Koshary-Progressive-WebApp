var staticCacheName = 'kohsary-static-v1';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
          'index.html',
        'js/main.js',
        'js/dbhelper.js',
        'js/restuarant_info.js',
        'data/restautrants.js',
        'css/styles.css',
            'https://normalize-css.googlecode.com/svn/trunk/normalize.css',
        'icon.png',
          'img/logo-horizontal.png',
          'img/logo-horizontal_nnfx9z_c_scale,w_200.png',
          'logo-horizontal_nnfx9z_c_scale,w_521.png',
                'https://maps.googleapis.com/maps/api/js?key=AIzaSyAmX7Od4d5_bvaU2XMccR39jCSmi5d5eWg&libraries=places&callback=initMap'
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

    //  if (requestUrl.origin === location.origin) {
    //    if (requestUrl.pathname === '/') {
    //      event.respondWith(caches.match('/skeleton'));
    //      return;
    //    }
    //  }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
