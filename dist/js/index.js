'use strict';

function IndexController() {
    this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function () {
    if (!navigator.serviceWorker) return;

    var indexController = this;

    navigator.serviceWorker.register('sw.js').then(function (reg) {
        if (!navigator.serviceWorker.controller) {
            return;
        }

        if (reg.waiting) {
            indexController._updateReady(reg.waiting);
            return;
        }

        if (reg.installing) {
            indexController._trackInstalling(reg.installing);
            return;
        }

        reg.addEventListener('updatefound', function () {
            indexController._trackInstalling(reg.installing);
        });
    });

    // Ensure refresh is only called once.
    // This works around a bug in "force update on reload".
    var refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
    navigator.serviceWorker.addEventListener('message', function (event) {
        console.log(event.data.msg, event.data.url);
    });
};

IndexController.prototype._trackInstalling = function (worker) {
    var indexController = this;
    worker.addEventListener('statechange', function () {
        if (worker.state == 'installed') {
            indexController._updateReady(worker);
        }
    });
};

IndexController.prototype._updateReady = function (worker) {

    var toast = confirm("New version available, do you want to upate ?");

    if (toast != null) {
        worker.postMessage({
            action: 'skipWaiting'
        });
    }
};

//initialize sw
var swController = new IndexController();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * indexdb helper.
 */
var IndexDBHelper = function () {
    function IndexDBHelper() {
        _classCallCheck(this, IndexDBHelper);
    }

    _createClass(IndexDBHelper, null, [{
        key: 'openDatabase',
        value: function openDatabase() {
            // If the browser doesn't support service worker,
            // we don't care about having a database
            if (!navigator.serviceWorker) {
                return Promise.resolve();
            }

            return idb.open('koshary', 4, function (upgradeDb) {
                switch (upgradeDb.oldVersion) {
                    case 0:
                        var restaurantStore = upgradeDb.createObjectStore('restaurants', {
                            keyPath: 'id'
                        });
                        restaurantStore.createIndex('id', 'id');
                    case 1:
                        var reviewStore = upgradeDb.createObjectStore('reviews', {
                            keyPath: 'id'
                        });
                        reviewStore.createIndex('id', 'id');
                    case 2:
                        var offlineReview = upgradeDb.createObjectStore('offline-reviews', { keyPath: "id", autoIncrement: true });
                    case 3:
                        var offlineRestaurantFavorite = upgradeDb.createObjectStore('offline-favorite', { keyPath: "id", autoIncrement: true });
                }
            });
        }
    }, {
        key: 'storeRestaurants',
        value: function storeRestaurants(restaurants) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('restaurants', 'readwrite');
                var store = tx.objectStore('restaurants');
                restaurants.forEach(function (restaurant) {
                    store.put(restaurant);
                });
                tx.complete;
            }).then(function () {
                callback(null, restaurants);
            });
        }
    }, {
        key: 'fetchRestaurants',
        value: function fetchRestaurants(callback) {
            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('restaurants', 'readwrite');
                var store = tx.objectStore('restaurants');
                var idIndex = store.index("id");
                return idIndex.getAll();
            }).then(function (json) {
                callback(null, json);
            });
        }
    }, {
        key: 'fetchRestaurantById',
        value: function fetchRestaurantById(id) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('restaurants', 'readwrite');
                var store = tx.objectStore('restaurants');
                var idIndex = store.index("id");
                return idIndex.getAll();
            }).then(function (restaurants) {
                var restaurant = restaurants.find(function (restaurant, i) {
                    return restaurant.id == id;
                });
                restaurant = restaurant[0];
                callback(null, restaurant);
            });
        }
    }, {
        key: 'toggleRestaurantFavorite',
        value: function toggleRestaurantFavorite(restaurant) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('restaurants', 'readwrite');
                var store = tx.objectStore('restaurants');
                store.put(restaurant);
                return tx.complete;
            }).then(function () {
                callback(null, restaurant);
            });
        }
    }, {
        key: 'storeReviews',
        value: function storeReviews(reviews) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            //cach reviews in indexdb
            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('reviews', 'readwrite');
                var store = tx.objectStore('reviews');
                reviews.forEach(function (review) {
                    store.put(review);
                });
                return tx.complete;
            }).then(function () {
                callback(null, reviews);
            });
        }
    }, {
        key: 'fetchReviews',
        value: function fetchReviews(id) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('reviews', 'readwrite');
                var store = tx.objectStore('reviews');
                var idIndex = store.index("id");
                return idIndex.getAll;
            }).then(function (reviews) {
                var restraintReviewArray = {};
                if (id) {
                    restraintReviewArray = reviews.filter(function (review, i) {
                        return review["restaurant_id"] == restaurantId;
                    });
                } else {
                    restraintReviewArray = reviews;
                }
                callback(null, restraintReviewArray);
            });
        }
    }, {
        key: 'postReview',
        value: function postReview(review) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('reviews', 'readwrite');
                var store = tx.objectStore('reviews');
                store.put(review);
                return tx.complete;
            }).then(function () {
                callback(null, review);
            });
        }
    }, {
        key: 'postReviewOffline',
        value: function postReviewOffline(review) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('offline-reviews', 'readwrite');
                var store = tx.objectStore('offline-reviews');
                store.put(review);
                return tx.complete;
            }).then(function () {
                callback(null, review);
            });
        }
    }, {
        key: 'postFavoriteOffline',
        value: function postFavoriteOffline(restaurant) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            IndexDBHelper.openDatabase().then(function (db) {
                if (!db) return;
                var tx = db.transaction('offline-favorite', 'readwrite');
                var store = tx.objectStore('offline-favorite');
                store.put(restaurant);
                return tx.complete;
            }).then(function () {
                callback(null, restaurant);
            });
        }
    }]);

    return IndexDBHelper;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Common database helper functions.
 */
var DBHelper = function () {
    function DBHelper() {
        _classCallCheck(this, DBHelper);
    }

    _createClass(DBHelper, null, [{
        key: 'fetchRestaurants',


        /**
         * Fetch all restaurants.
         */
        value: function fetchRestaurants(callback) {
            fetch(DBHelper.DATABASE_URL + '/restaurants').then(function (response) {
                return response.json();
            }).then(function (restaurants) {
                //open indexdb to cach all restaurants data
                IndexDBHelper.storeRestaurants(restaurants);
                callback(null, restaurants);
            }).catch(function (ex) {
                var error = 'Request failed. Returned status of ' + ex;
                IndexDBHelper.fetchRestaurants(callback);
            });
        }

        /**
         * Fetch a restaurant by its ID.
         */

    }, {
        key: 'fetchRestaurantById',
        value: function fetchRestaurantById(id, callback) {
            fetch(DBHelper.DATABASE_URL + '/restaurants/' + id).then(function (response) {
                return response.json();
            }).then(function (restaurant) {

                //add restuarants object array into a variable
                callback(null, restaurant);
            }).catch(function (ex) {
                var error = 'Request failed. Returned status of ' + ex;
                IndexDBHelper.fetchRestaurantById(id, callback);
            });
        }

        /**
         * Fetch a restaurant by its ID.
         */

    }, {
        key: 'toggleRestaurantFavorite',
        value: function toggleRestaurantFavorite(id, callback) {
            DBHelper.fetchRestaurantById(id, function (error, restaurant) {
                if (error) {
                    callback(error, null);
                } else {

                    //send to option the opposite of what is currently set
                    restaurant.is_favorite = restaurant.is_favorite == "false" ? "true" : "false";
                    fetch(DBHelper.DATABASE_URL + '/restaurants/' + id + '/?is_favorite=' + restaurant.is_favorite, {
                        method: 'POST'
                    }).then(function (response) {
                        return response.json();
                    }).then(function (restaurant) {
                        IndexDBHelper.toggleRestaurantFavorite(restaurant);
                        callback(null, restaurant);
                    }).catch(function (ex) {
                        // TODO: add offline favorite to indexdb
                        var error = 'Request failed. Returned status of ' + ex;
                        //get response from index db if available
                        IndexDBHelper.postFavoriteOffline(restaurant, callback);
                    });
                }
            });
        }

        /**
         * Fetch restaurants by a cuisine type with proper error handling.
         */

    }, {
        key: 'fetchRestaurantByCuisine',
        value: function fetchRestaurantByCuisine(cuisine, callback) {
            // Fetch all restaurants  with proper error handling
            DBHelper.fetchRestaurants(function (error, restaurants) {
                if (error) {
                    callback(error, null);
                } else {
                    // Filter restaurants to have only given cuisine type
                    var results = restaurants.filter(function (r) {
                        return r.cuisine_type == cuisine;
                    });
                    callback(null, results);
                }
            });
        }

        /**
         * Fetch restaurants by a neighborhood with proper error handling.
         */

    }, {
        key: 'fetchRestaurantByNeighborhood',
        value: function fetchRestaurantByNeighborhood(neighborhood, callback) {
            // Fetch all restaurants
            DBHelper.fetchRestaurants(function (error, restaurants) {
                if (error) {
                    callback(error, null);
                } else {
                    // Filter restaurants to have only given neighborhood
                    var results = restaurants.filter(function (r) {
                        return r.neighborhood == neighborhood;
                    });
                    callback(null, results);
                }
            });
        }

        /**
         * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
         */

    }, {
        key: 'fetchRestaurantByCuisineAndNeighborhood',
        value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
            // Fetch all restaurants
            DBHelper.fetchRestaurants(function (error, restaurants) {
                if (error) {
                    callback(error, null);
                } else {
                    var results = restaurants;
                    if (cuisine != 'all') {
                        // filter by cuisine
                        results = results.filter(function (r) {
                            return r.cuisine_type == cuisine;
                        });
                    }
                    if (neighborhood != 'all') {
                        // filter by neighborhood
                        results = results.filter(function (r) {
                            return r.neighborhood == neighborhood;
                        });
                    }
                    callback(null, results);
                }
            });
        }

        /**
         * Fetch all neighborhoods with proper error handling.
         */

    }, {
        key: 'fetchNeighborhoods',
        value: function fetchNeighborhoods(callback) {
            // Fetch all restaurants
            DBHelper.fetchRestaurants(function (error, restaurants) {
                if (error) {
                    callback(error, null);
                } else {
                    // Get all neighborhoods from all restaurants
                    var neighborhoods = restaurants.map(function (v, i) {
                        return restaurants[i].neighborhood;
                    });
                    // Remove duplicates from neighborhoods
                    var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
                        return neighborhoods.indexOf(v) == i;
                    });
                    callback(null, uniqueNeighborhoods);
                }
            });
        }

        /**
         * Fetch all cuisines with proper error handling.
         */

    }, {
        key: 'fetchCuisines',
        value: function fetchCuisines(callback) {
            // Fetch all restaurants
            DBHelper.fetchRestaurants(function (error, restaurants) {
                if (error) {
                    callback(error, null);
                } else {
                    // Get all cuisines from all restaurants
                    var cuisines = restaurants.map(function (v, i) {
                        return restaurants[i].cuisine_type;
                    });
                    // Remove duplicates from cuisines
                    var uniqueCuisines = cuisines.filter(function (v, i) {
                        return cuisines.indexOf(v) == i;
                    });
                    callback(null, uniqueCuisines);
                }
            });
        }
        /**
         * get a review on a restaurant
         */

    }, {
        key: 'fetchRestaurantReview',
        value: function fetchRestaurantReview(restaurantId, callback) {
            fetch(DBHelper.DATABASE_URL + '/reviews').then(function (response) {
                return response.json();
            }).then(function (reviews) {
                var restraintReviewArray = reviews.filter(function (review, i) {
                    return review["restaurant_id"] == restaurantId;
                });

                IndexDBHelper.storeReviews(reviews);

                callback(null, restraintReviewArray);
            }).catch(function (ex) {
                var error = 'Request failed. Returned status of ' + ex;
                //get response from index db if available
                IndexDBHelper.fetchReviews(restaurantId, callback);
            });
        }

        /**
         * post a review on a restaurant
         */

    }, {
        key: 'postRestaurantReview',
        value: function postRestaurantReview(review, callback) {
            fetch(DBHelper.DATABASE_URL + '/reviews', {
                method: "POST",
                body: review
            }).then(function (response) {
                return response.json();
            }).then(function (addedReview) {
                //cach reviews in indexdb
                review = Object.assign(addedReview, review);
                IndexDBHelper.postReview(review);
                callback(null, review);
            }).catch(function (ex) {
                var error = 'Request failed. Returned status of ' + ex;
                IndexDBHelper.postReviewOffline(review, callback);
            });
        }

        /**
         * Restaurant page URL.
         */

    }, {
        key: 'urlForRestaurant',
        value: function urlForRestaurant(restaurant) {
            return './restaurant.html?id=' + restaurant.id;
        }

        /**
         * Restaurant image URL.
         */

    }, {
        key: 'imageUrlForRestaurant',
        value: function imageUrlForRestaurant(restaurant) {
            return '/img/' + restaurant.photograph;
        }

        /**
         * Map marker for a restaurant.
         */

    }, {
        key: 'mapMarkerForRestaurant',
        value: function mapMarkerForRestaurant(restaurant, map) {
            var marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            });
            return marker;
        }
    }, {
        key: 'DATABASE_URL',


        /**
         * Database URL.
         * Change this to restaurants.json file location on your server.
         */
        get: function get() {
            //const port = location.port ? location.port : 8000 // Change this to your server port
            var port = 1337; //change according to gulpfile config
            //const host = location.hostname ? location.hostname : 'localhost';
            var host = 'localhost';
            return 'http://' + host + ':' + port;
        }
    }]);

    return DBHelper;
}();
'use strict';

var restaurants = void 0,
    neighborhoods = void 0,
    cuisines = void 0,
    map = void 0,
    markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', function (event) {

    getAllRestaurants();
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
var fetchNeighborhoods = function fetchNeighborhoods() {
    DBHelper.fetchNeighborhoods(function (error, neighborhoods) {
        if (error) {
            // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = function fillNeighborhoodsHTML() {
    var neighborhoods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.neighborhoods;

    var select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(function (neighborhood) {
        var option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
var fetchCuisines = function fetchCuisines() {
    DBHelper.fetchCuisines(function (error, cuisines) {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = function fillCuisinesHTML() {
    var cuisines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cuisines;

    var select = document.getElementById('cuisines-select');

    cuisines.forEach(function (cuisine) {
        var option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Initialize Google map, called from HTML.
 */
function initMap() {
    var loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    if (!self.map) {
        self.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: loc,
            scrollwheel: false
        });
    }

    document.getElementById("map-container").classList.add("show-interactive-map");
    //set markers on the map
    addMarkersToMap();
}

var initStaticMap = function initStaticMap() {
    var latlng = "40.722216,-73.987501",
        zoom = 12,
        imageConrtainer = document.getElementById("map-container");
    var size = imageConrtainer.offsetWidth + "x" + imageConrtainer.offsetHeight;
    var staticMapURL = 'https://maps.googleapis.com/maps/api/staticmap?center=' + latlng + '&zoom=' + zoom + '&size=' + size + '&key=AIzaSyD7zwXocDxCO_YLSyVhDNYZDmhMxr0RcNU';
    restaurants.forEach(function (restaurant) {
        staticMapURL += '&markers=' + restaurant.latlng.lat + ',' + restaurant.latlng.lng;
    });
    document.querySelector(".static-map").setAttribute("src", staticMapURL);
};
var getAllRestaurants = function getAllRestaurants() {
    DBHelper.fetchRestaurantByCuisineAndNeighborhood("all", "all", function (error, restaurants) {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
            initStaticMap();
        }
    });
};
/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = function updateRestaurants() {
    var cSelect = document.getElementById('cuisines-select');
    var nSelect = document.getElementById('neighborhoods-select');
    //get slected option value
    var cuisine = cSelect[cSelect.selectedIndex].value;
    var neighborhood = nSelect[nSelect.selectedIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, function (error, restaurants) {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
            initMap();
        }
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = function resetRestaurants(restaurants) {
    // Remove all restaurants
    self.restaurants = [];
    var ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(function (m) {
        return m.setMap(null);
    });
    self.markers = [];
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = function fillRestaurantsHTML() {
    var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

    var ul = document.getElementById('restaurants-list');
    restaurants.forEach(function (restaurant) {
        ul.append(createRestaurantHTML(restaurant));
    });

    //now we have to fill the static image first
    //addMarkersToMap();
    //init lazy loading
    setTimeout(function () {
        bLazy.revalidate();
    }, 10);
};

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = function createRestaurantHTML(restaurant) {
    var li = document.createElement('li');
    li.setAttribute("role", "listitem");

    var image = document.createElement('img');
    var imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
    image.className = 'restaurant-img b-lazy';
    image.src = "/img/placeholder-image.jpg";
    image.setAttribute("data-src", '' + imageSrc);
    image.setAttribute("data-srcset", '/img/' + restaurant.id + '_300.jpg 300w,/img/' + restaurant.id + '.jpg 586w,/img/' + restaurant.id + '_800.jpg 800w');
    image.alt = restaurant.name;
    var picture = document.createElement('picture');
    picture.append(image);
    li.append(picture);
    var dataContainer = document.createElement('article');
    li.append(dataContainer);
    var name = document.createElement('a');
    name.innerHTML = restaurant.name;
    name.href = DBHelper.urlForRestaurant(restaurant);
    dataContainer.append(name);

    var neighborhood = document.createElement('p');
    neighborhood.setAttribute("title", "Neighborhood");
    neighborhood.innerHTML = restaurant.neighborhood;
    dataContainer.append(neighborhood);

    var address = document.createElement('address');
    address.innerHTML = restaurant.address;
    dataContainer.append(address);

    var more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.classList.add("more");
    more.setAttribute("role", "button");
    more.href = DBHelper.urlForRestaurant(restaurant);
    dataContainer.append(more);

    var addTofavoriteButton = document.createElement("button");

    addTofavoriteButton.classList.add("add-tofavorite");
    if (restaurant.is_favorite == "true" || restaurant.is_favorite == true) {
        addTofavoriteButton.classList.add("favorite");
        addTofavoriteButton.innerHTML = '<span>★</span> Favorited';
        addTofavoriteButton.title = "Click to remove from favorite";
    } else {
        addTofavoriteButton.innerHTML = '<span>☆</span> Add To Favorite';
    }
    addTofavoriteButton.setAttribute("role", "button");
    addTofavoriteButton.setAttribute("onclick", "addRestaurantToFavorite(this)");
    addTofavoriteButton.dataset.restaurantId = restaurant.id;
    dataContainer.append(addTofavoriteButton);

    return li;
};

/**
 * Add retaurant to favorite.
 */
var addRestaurantToFavorite = function addRestaurantToFavorite(btn) {
    DBHelper.toggleRestaurantFavorite(btn.dataset['restaurantId'], function (error, response) {
        if (error) alert(error);
        if (response.is_favorite == "false") {
            btn.classList.remove("favorite");
            btn.innerHTML = '<span>☆</span> Add To Favorite';
        } else {
            btn.innerHTML = '<span>★</span> Favorited';
            btn.title = "Click to remove from favorite";
            btn.classList.add("favorite");
        }
    });
};

/**                                                                                                                                                                                                                                                                                                                                                                                                             
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = function addMarkersToMap() {
    var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

    restaurants.forEach(function (restaurant) {
        // Add marker to the map
        var marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', function () {
            window.location.href = marker.url;
        });
        self.markers.push(marker);
    });
};

/*change aria expanded value*/
var changeAriaValue = function changeAriaValue(that) {
    that.getAttribute("aria-expanded") == "true" ? that.setAttribute("aria-expanded", "false") : that.setAttribute("aria-expanded", "true");
};

var bLazy = new Blazy({
    // Options
});
//# sourceMappingURL=index.js.map
