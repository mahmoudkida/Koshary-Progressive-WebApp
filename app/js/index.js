let restaurants,
    neighborhoods,
    cuisines, map, markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {

    getAllRestaurants();
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
 * Initialize Google map, called from HTML.
 */
function initMap() {
    let loc = {
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

const initStaticMap = () => {
    let latlng = "40.722216,-73.987501",
        zoom = 12,
        imageConrtainer = document.getElementById("map-container");
    let size = imageConrtainer.offsetWidth + "x" + imageConrtainer.offsetHeight;
    let staticMapURL = `https://maps.googleapis.com/maps/api/staticmap?center=${latlng}&zoom=${zoom}&size=${size}&key=AIzaSyD7zwXocDxCO_YLSyVhDNYZDmhMxr0RcNU`;
    restaurants.forEach((restaurant) => {
        staticMapURL += `&markers=${restaurant.latlng.lat},${restaurant.latlng.lng}` ;
    });
    document.querySelector(".static-map").setAttribute("src", staticMapURL);
}
const getAllRestaurants = () => {
    DBHelper.fetchRestaurantByCuisineAndNeighborhood("all", "all", (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
            initStaticMap();
        }
    })
}
/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');
    //get slected option value
    const cuisine = cSelect[cSelect.selectedIndex].value;
    const neighborhood = nSelect[nSelect.selectedIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
            initMap();
        }
    })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });

    //now we have to fill the static image first
    //addMarkersToMap();
    //init lazy loading
    setTimeout(function () {
        bLazy.revalidate();
    }, 10);
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    li.setAttribute("role", "listitem")

    const image = document.createElement('img');
    const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
    image.className = 'restaurant-img b-lazy';
    image.src = "/img/placeholder-image.jpg";
    image.setAttribute("data-src", `${imageSrc}`);
    image.setAttribute("data-srcset", `/img/${restaurant.id}_300.jpg 300w,/img/${restaurant.id}.jpg 586w,/img/${restaurant.id}_800.jpg 800w`);
    image.alt = restaurant.name;
    const picture = document.createElement('picture');
    picture.append(image);
    li.append(picture);
    const dataContainer = document.createElement('article');
    li.append(dataContainer);
    const name = document.createElement('a');
    name.innerHTML = restaurant.name;
    name.href = DBHelper.urlForRestaurant(restaurant);
    dataContainer.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.setAttribute("title", "Neighborhood");
    neighborhood.innerHTML = restaurant.neighborhood;
    dataContainer.append(neighborhood);

    const address = document.createElement('address');
    address.innerHTML = restaurant.address;
    dataContainer.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.classList.add("more");
    more.setAttribute("role", "button");
    more.href = DBHelper.urlForRestaurant(restaurant);
    dataContainer.append(more);

    const addTofavoriteButton = document.createElement("button");
   
    addTofavoriteButton.classList.add("add-tofavorite");
    if(restaurant.is_favorite == "true" || restaurant.is_favorite == true){
        addTofavoriteButton.classList.add("favorite");
        addTofavoriteButton.innerHTML = '<span>★</span> Favorited';
        addTofavoriteButton.title = "Click to remove from favorite";
    }
    else{
         addTofavoriteButton.innerHTML = '<span>☆</span> Add To Favorite';
    }
    addTofavoriteButton.setAttribute("role", "button");
    addTofavoriteButton.setAttribute("onclick","addRestaurantToFavorite(this)");
    addTofavoriteButton.dataset.restaurantId = restaurant.id;
    dataContainer.append(addTofavoriteButton);

    return li;
}

/**
 * Add retaurant to favorite.
 */
const addRestaurantToFavorite = (btn) =>{
    DBHelper.toggleRestaurantFavorite(btn.dataset['restaurantId'],function(error,response){
        if(error) alert(error);
        if(response.is_favorite == "false"){
            btn.classList.remove("favorite");
            btn.innerHTML = '<span>☆</span> Add To Favorite';
        }else{
            btn.innerHTML = '<span>★</span> Favorited';
            btn.title = "Click to remove from favorite";
            btn.classList.add("favorite");
        }
    });
}

/**                                                                                                                                                                                                                                                                                                                                                                                                             
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url
        });
        self.markers.push(marker);
    });
}

/*change aria expanded value*/
const changeAriaValue = (that) => {
    that.getAttribute("aria-expanded") == "true" ? that.setAttribute("aria-expanded", "false") : that.setAttribute("aria-expanded", "true");
}



const bLazy = new Blazy({
    // Options
});
