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
    worker.postMessage({ action: 'skipWaiting' });
  }
};

//initialize sw
var swController = new IndexController();
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
        key: 'openDatabase',
        value: function openDatabase() {
            // If the browser doesn't support service worker,
            // we don't care about having a database
            if (!navigator.serviceWorker) {
                return Promise.resolve();
            }

            return idb.open('koshary', 1, function (upgradeDb) {
                var store = upgradeDb.createObjectStore('restaurants', {
                    keyPath: 'id'
                });
                store.createIndex('id', 'id');
            });
        }

        /**
         * Database URL.
         * Change this to restaurants.json file location on your server.
         */

    }, {
        key: 'fetchRestaurants',


        /**
         * Fetch all restaurants.
         */
        value: function fetchRestaurants(callback) {
            fetch(DBHelper.DATABASE_URL).then(function (response) {
                return response.json();
            }).then(function (json) {

                //add restuarants object array into a variable
                var restaurants = json;
                //open indexdb to cach all restaurants data
                DBHelper.openDatabase().then(function (db) {
                    if (!db) return;
                    var tx = db.transaction('restaurants', 'readwrite');
                    var store = tx.objectStore('restaurants');
                    restaurants.forEach(function (restaurant) {
                        store.put(restaurant);
                    });
                });
                callback(null, restaurants);
            }).catch(function (ex) {
                var error = 'Request failed. Returned status of ' + ex;
                DBHelper.openDatabase().then(function (db) {
                    if (!db) return;
                    var tx = db.transaction('restaurants', 'readwrite');
                    var store = tx.objectStore('restaurants');
                    var idIndex = store.index("id");
                    return idIndex.getAll();
                }).then(function (json) {
                    var restaurants = json;
                    callback(null, restaurants);
                });
            });
        }

        /**
         * Fetch a restaurant by its ID.
         */

    }, {
        key: 'fetchRestaurantById',
        value: function fetchRestaurantById(id, callback) {
            // fetch all restaurants with proper error handling.
            DBHelper.fetchRestaurants(function (error, restaurants) {
                if (error) {
                    callback(error, null);
                } else {
                    var restaurant = restaurants.find(function (r) {
                        return r.id == id;
                    });
                    if (restaurant) {
                        // Got the restaurant
                        callback(null, restaurant);
                    } else {
                        // Restaurant does not exist in the database
                        callback('Restaurant does not exist', null);
                    }
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
        get: function get() {
            //const port = location.port ? location.port : 8000 // Change this to your server port
            var port = 1337; //change according to gulpfile config
            //const host = location.hostname ? location.hostname : 'localhost';
            var host = 'localhost';
            return 'http://' + host + ':' + port + '/restaurants';
        }
    }]);

    return DBHelper;
}();
'use strict';

var restaurant = void 0,
    map = void 0;

document.addEventListener('DOMContentLoaded', function (event) {

    fetchRestaurantFromURL(function (error, restaurant) {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            fillBreadcrumb();
        }
    });
});

/**
 * Initialize Google map, called from HTML.
 */

var initMap = function initMap() {
    if (!self.map) {
        self.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: restaurant.latlng,
            scrollwheel: false
        });
    }
    document.getElementById("map-container").classList.add("show-interactive-map");

    DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
};

var initStaticMap = function initStaticMap() {
    var latlng = restaurant.latlng.lat + ',' + restaurant.latlng.lng,
        zoom = 12,
        imageConrtainer = document.getElementById("map-container");
    var size = imageConrtainer.offsetWidth + "x" + imageConrtainer.offsetHeight;
    var staticMapURL = 'https://maps.googleapis.com/maps/api/staticmap?center=' + latlng + '&zoom=' + zoom + '&size=' + size + '&key=AIzaSyD7zwXocDxCO_YLSyVhDNYZDmhMxr0RcNU';
    staticMapURL += '&markers=' + restaurant.latlng.lat + ',' + restaurant.latlng.lng;
    document.querySelector(".static-map").setAttribute("src", staticMapURL);
};

/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = function fetchRestaurantFromURL(callback) {
    if (self.restaurant) {
        // restaurant already fetched!
        callback(null, self.restaurant);
        return;
    }
    var id = getParameterByName('id');
    if (!id) {
        // no id found in URL
        var error = 'No restaurant id in URL';
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, function (error, restaurant) {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            initStaticMap();
            callback(null, restaurant);
            //init lazy loading
            setTimeout(function () {
                bLazy.revalidate();
            }, 10);
        });
    }
};
/**
 * Create restaurant HTML and add it to the webpage
 */
var fillRestaurantHTML = function fillRestaurantHTML() {
    var restaurant = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant;

    var name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    var address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    var image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img b-lazy';
    //image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.src = "/img/placeholder-image.png";
    image.setAttribute("data-src", '' + DBHelper.imageUrlForRestaurant(restaurant));
    image.setAttribute("data-srcset", '/img/' + restaurant.id + '_300.jpg 300w,/img/' + restaurant.id + '.jpg 586w,/img/' + restaurant.id + '_800.jpg 800w');

    //    image.setAttribute("data-src-small",`img/${restaurant.id}_300.jpg`);
    //    image.setAttribute("data-src-medium",`img/${restaurant.id}_580.jpg`);
    //    image.setAttribute("data-src-large",`img/${restaurant.id}_800.jpg`);
    image.setAttribute("alt", restaurant.name + 'Restaurant Main Image, ');

    var cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = function fillRestaurantHoursHTML() {
    var operatingHours = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant.operating_hours;

    var hours = document.getElementById('restaurant-hours');
    for (var key in operatingHours) {
        var row = document.createElement('tr');

        var day = document.createElement('th');
        day.setAttribute("role", "rowheader");
        day.innerHTML = key;
        row.appendChild(day);

        var time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
var fillReviewsHTML = function fillReviewsHTML() {
    var reviews = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant.reviews;

    var container = document.getElementById('reviews-container');
    var title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        var noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    var ul = document.getElementById('reviews-list');
    reviews.forEach(function (review) {
        ul.appendChild(createReviewHTML(review));
    });

    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
var createReviewHTML = function createReviewHTML(review) {
    var li = document.createElement('li');
    li.setAttribute("role", "listitem");

    var name = document.createElement('h3');
    name.innerHTML = review.name;
    li.appendChild(name);

    var date = document.createElement('date');
    date.innerHTML = review.date;
    date.setAttribute("datetime", review.date);
    li.appendChild(date);

    var rating = document.createElement('p');
    rating.setAttribute("title", "1 to 5 rating");
    rating.innerHTML = 'Rating: ' + review.rating;
    li.appendChild(rating);

    var comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = function fillBreadcrumb() {
    var restaurant = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant;

    var breadcrumb = document.getElementById('breadcrumb');
    var li = document.createElement('li');
    li.innerHTML = restaurant.name;
    li.setAttribute("aria-current", "page");
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

var bLazy = new Blazy({
    // Options
});
//# sourceMappingURL=restaurant_info.js.map
