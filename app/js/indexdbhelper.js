/**
 * indexdb helper.
 */
class IndexDBHelper {
    static openDatabase() {
        // If the browser doesn't support service worker,
        // we don't care about having a database
        if (!navigator.serviceWorker) {
            return Promise.resolve();
        }

        return idb.open('koshary', 4, upgradeDb => {
            switch (upgradeDb.oldVersion) {
                case 0:
                    let restaurantStore = upgradeDb.createObjectStore('restaurants', {
                        keyPath: 'id'
                    });
                    restaurantStore.createIndex('id', 'id');
                case 1:
                    let reviewStore = upgradeDb.createObjectStore('reviews', {
                        keyPath: 'id'
                    });
                    reviewStore.createIndex('id', 'id');
                case 2:
                    let offlineReview = upgradeDb.createObjectStore('offline-reviews',{ keyPath: "id", autoIncrement: true });
                case 3:
                    let offlineRestaurantFavorite = upgradeDb.createObjectStore('offline-favorite',{ keyPath: "id", autoIncrement: true });
            }

        });
    }


    static storeRestaurants(restaurants, callback = () => {}) {
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('restaurants', 'readwrite');
            let store = tx.objectStore('restaurants');
            restaurants.forEach(function (restaurant) {
                store.put(restaurant);
            });
            tx.complete;
        }).then(() => {
            callback(null,restaurants);
        });
    }

    static fetchRestaurants(callback) {
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('restaurants', 'readwrite');
            let store = tx.objectStore('restaurants');
            let idIndex = store.index("id");
            return idIndex.getAll();
        }).then((json) => {
            callback(null, json);
        });
    }
    static fetchRestaurantById(id, callback = () => {}) {
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('restaurants', 'readwrite');
            let store = tx.objectStore('restaurants');
             let idIndex = store.index("id");
            return idIndex.getAll(); 
        }).then((restaurants) => {
            let restaurant = restaurants.find((restaurant, i) => restaurant.id == id);
            restaurant = restaurant[0];
            callback(null,restaurant);
        });

    }

    static toggleRestaurantFavorite(restaurant, callback = () => {}) {
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('restaurants', 'readwrite');
            let store = tx.objectStore('restaurants');
            store.put(restaurant);
            return tx.complete;
        }).then(()=>{
             callback(null, restaurant);
        });
    }




    static storeReviews(reviews, callback = () => {}) {
        //cach reviews in indexdb
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('reviews', 'readwrite');
            let store = tx.objectStore('reviews');
            reviews.forEach(function (review) {
                store.put(review);
            });
            return tx.complete;
        }).then(() => {
            callback(null, reviews);
        });

    }

    static fetchReviews(id, callback = () => {}) {
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('reviews', 'readwrite');
            let store = tx.objectStore('reviews');
            let idIndex = store.index("id");
            return idIndex.getAll;
        }).then((reviews) => {
            let restraintReviewArray = {};
            if (id) {
                restraintReviewArray = reviews.filter((review, i) => review["restaurant_id"] == restaurantId);
            } else {
                restraintReviewArray = reviews;
            }
            callback(null, restraintReviewArray);
        });
    }
    static postReview(review, callback = () => {}) {
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('reviews', 'readwrite');
            let store = tx.objectStore('reviews');
            store.put(review);
            return tx.complete;
        }).then(() => {
            callback(null,review);
        });
    }

    static postReviewOffline(review, callback = () => {}) {
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('offline-reviews', 'readwrite');
            let store = tx.objectStore('offline-reviews');
            store.put(review);
            return tx.complete;
        }).then(() => {
            callback(null, review);
        });
    }
    
    static postFavoriteOffline(restaurant, callback = () => {}) {
        IndexDBHelper.openDatabase().then((db) => {
            if (!db) return;
            let tx = db.transaction('offline-favorite', 'readwrite');
            let store = tx.objectStore('offline-favorite');
            store.put(restaurant);
            return tx.complete;
        }).then(() => {
            callback(null, restaurant);
        });
    }
}
