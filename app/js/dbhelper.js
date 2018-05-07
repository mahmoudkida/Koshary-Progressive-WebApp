/**
 * Common database helper functions.
 */
class DBHelper {




    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        //const port = location.port ? location.port : 8000 // Change this to your server port
        const port = 1337; //change according to gulpfile config
        //const host = location.hostname ? location.hostname : 'localhost';
        const host = 'localhost';
        return `http://${host}:${port}`;
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        fetch(DBHelper.DATABASE_URL + '/restaurants').then((response) => {
            return response.json();
        }).then((restaurants) => {
            //open indexdb to cach all restaurants data
            IndexDBHelper.storeRestaurants(restaurants);
            callback(null, restaurants);

        }).catch((ex) => {
            const error = (`Request failed. Returned status of ${ex}`);
            IndexDBHelper.fetchRestaurants(callback);
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        fetch(DBHelper.DATABASE_URL + '/restaurants/' + id).then((response) => {
            return response.json();
        }).then((restaurant) => {

            //add restuarants object array into a variable
            callback(null, restaurant);

        }).catch((ex) => {
            const error = (`Request failed. Returned status of ${ex}`);
            IndexDBHelper.fetchRestaurantById(id, callback);
        });
    }


    /**
     * Fetch a restaurant by its ID.
     */
    static toggleRestaurantFavorite(id, callback) {
        DBHelper.fetchRestaurantById(id, function (error, restaurant) {
            if (error) {
                callback(error, null);
            } else {

                //send to option the opposite of what is currently set
                restaurant.is_favorite = (restaurant.is_favorite == "false" ? "true" : "false");
                fetch(DBHelper.DATABASE_URL + '/restaurants/' + id + '/?is_favorite=' + restaurant.is_favorite, {
                        method: 'POST'
                    }).then((response) => {
                    return response.json();
                }).then((restaurant) => {
                    IndexDBHelper.toggleRestaurantFavorite(restaurant);
                    callback(null, restaurant);
                }).catch((ex) => {
                    // TODO: add offline favorite to indexdb
                    const error = (`Request failed. Returned status of ${ex}`);
                    //get response from index db if available
                    IndexDBHelper.postFavoriteOffline(restaurant, callback);
                });
            }

        })
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }
    /**
     * get a review on a restaurant
     */
    static fetchRestaurantReview(restaurantId, callback) {
        fetch(DBHelper.DATABASE_URL + '/reviews').then((response) => {
            return response.json();
        }).then((reviews) => {
            const restraintReviewArray = reviews.filter((review, i) => review["restaurant_id"] == restaurantId)

            IndexDBHelper.storeReviews(reviews);

            callback(null, restraintReviewArray);
        }).catch((ex) => {
            const error = (`Request failed. Returned status of ${ex}`);
            //get response from index db if available
            IndexDBHelper.fetchReviews(restaurantId, callback);
        });
    }

    /**
     * post a review on a restaurant
     */

    static postRestaurantReview(review, callback) {
        fetch(DBHelper.DATABASE_URL + '/reviews', {
            method: "POST",
            body: review,
        }).then((response) => {
            return response.json();
        }).then((addedReview) => {
            //cach reviews in indexdb
            review = Object.assign(addedReview,review);
            IndexDBHelper.postReview(review);
            callback(null, review);
        }).catch((ex) => {
            const error = (`Request failed. Returned status of ${ex}`);
            IndexDBHelper.postReviewOffline(review, callback);
        });
    }


    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.photograph}`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP
        });
        return marker;
    }

}
