class IndexPage {
  constructor(map) {
    this.map = map;
    this.markers = [];
    this.restaurants = null;
  }
  setRestaurants(restaurants) {
    this.restaurants = restaurants;
    return this;
  }
  /**
   * Hide the loading screen when the data is binded.
   * TODO: export as module to be used in both html page.
   */
  hideLoadingScreen() {
    const loadingScreen = document.querySelector(".loading-screen");
    loadingScreen.style.display = "none";
    return this;
  }
  /**
   * Fetch all neighborhoods and set their HTML.
   */
  fetchFilters() {
    getFilters()
      .then(filters => {
        if (filters.neighborhoods) {
          this.fillFilterHtml(filters.neighborhoods, "neighborhoods-select");
        }
        if (filters.cuisines) {
          this.fillFilterHtml(filters.cuisines, "cuisines-select");
        }
      })
      .catch(err => {
        console.error("fetchNeighborhoods", err);
      });
    return this;
  }
  /**
   * Set Filter HTML.
   */
  fillFilterHtml(items, targetElement) {
    const select = document.getElementById(targetElement);
    items.forEach(item => {
      if (item === undefined) return;
      const option = document.createElement("option");
      option.innerHTML = item;
      option.value = item;
      select.append(option);
    });
  }

  readFilters() {
    const cSelect = document.getElementById("cuisines-select");
    const nSelect = document.getElementById("neighborhoods-select");
    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;
    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;
    return {
      cuisine: cuisine,
      neighborhood: neighborhood
    };
  }

  /**
   * Update page and map for current restaurants.
   */
  updateRestaurants() {
    const filters = this.readFilters();
    document.getElementById("filters-modal").style.display = "none";
    fetchRestaurantFiltered(filters)
      .then(restaurants => {
        this.setRestaurants(restaurants)
          .resetRestaurants()
          .fillRestaurantsHTML()
          .hideLoadingScreen()
          .createStaticMapImageElement()
          .updateMap();
      })
      .catch(err => {
        console.error(err);
      });
    return this;
  }
  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants() {
    const ul = document.getElementById("restaurants-list");
    ul.innerHTML = "";
    // Remove all map markers
    this.resetMarkers();
    return this;
  }

  /**
   * Reset the markers of the dynamic map
   */
  resetMarkers() {
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
  }
  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  fillRestaurantsHTML() {
    const ul = document.getElementById("restaurants-list");
    let noResultsElement = document.querySelector(".no-restaurant-msg");
    if (this.restaurants.length === 0) {
      noResultsElement.style.display = "block";
    } else {
      //Make sure the paragraph is not displayed on a new search
      //yielding results after an empty search.
      noResultsElement.style.display = "none";
    }
    this.restaurants.forEach(restaurant => {
      ul.append(this.createRestaurantHTML(restaurant));
    });
    const filtersContainer = document.getElementById("filters");
    //console.log("about to focus element id filters...");
    filtersContainer.focus();
    //console.log("element id filters focused? document.activeElement:", document.activeElement);
    return this;
  }
  /**
   * Create restaurant HTML.
   */
  createRestaurantHTML(restaurant) {
    const li = document.createElement("li");
    li.className = "restaurant-container row-default";
    const imageContainer = document.createElement("div");
    imageContainer.className = "restaurant-img-container";
    const image = document.createElement("img");
    image.className = "lazyload restaurant-img";
    image.alt = `${restaurant.name} restaurant, ${restaurant.shortDesc}`;
    image.src = imageUrlForRestaurant(restaurant, 128, true);
    image.setAttribute("data-src", imageUrlForRestaurant(restaurant, 128));
    imageContainer.appendChild(image);
    li.append(imageContainer);
    const descriptionItems = document.createElement("div");
    descriptionItems.className = "descriptions";
    const name = document.createElement("h2");
    name.innerHTML = restaurant.name;
    descriptionItems.append(name);
    const neighborhood = document.createElement("p");
    neighborhood.className = "neighborhood";
    neighborhood.innerHTML = restaurant.neighborhood;
    descriptionItems.append(neighborhood);
    const address = document.createElement("p");
    address.className = "address";
    address.innerHTML = restaurant.address;
    descriptionItems.append(address);
    li.append(descriptionItems);
    const moreContainer = document.createElement("span");
    moreContainer.className = "more-container";
    const more = document.createElement("a");
    const moreBtnTitle = `Read ${restaurant.name}'s restaurant details`;
    more.className = "c-btn btn-default btn-small btn-more";
    more.innerHTML = "View details";
    more.setAttribute("aria-label", moreBtnTitle);
    more.title = moreBtnTitle;
    more.href = urlForRestaurant(restaurant);
    moreContainer.appendChild(more);
    li.append(moreContainer);
    return li;
  }
  /**
   * Refresh the markers on the dynamic map.
   */
  updateMarkers() {
    const filters = this.readFilters();
    fetchRestaurantFiltered(filters).then(restaurants => {
      this.setRestaurants(restaurants).addMarkersToMap();
    });
  }
  /**
   * Add markers for current restaurants to the dynamic map.
   */
  addMarkersToMap() {
    this.resetMarkers();
    this.restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = MapsMarker.mapMarkerForRestaurant(restaurant, this.map);
      google.maps.event.addListener(marker, "click", () => {
        window.location.href = marker.url;
      });
      this.markers.push(marker);
    });
  }
  /**
   * Load the static Google Maps image.
   */
  createStaticMapImageElement() {
    const CSS_CLASS_IMG = "static-map-img";
    let staticMapContainer = document.querySelector("#static-map");
    let staticMapImg = document.querySelector(`.${CSS_CLASS_IMG}`);
    if (staticMapImg === null) {
      staticMapImg = document.createElement("img");
      staticMapImg.className = CSS_CLASS_IMG;
    }
    staticMapImg.alt =
      "Static Google Maps of New-york. Hover or click to view the restaurants location.";
    staticMapImg.src = new StaticMapGenerator("index").getApiUrl(
      this.restaurants
    );
    staticMapContainer.appendChild(staticMapImg);

    return this;
  }

  /**
   * Update the target map depending on the context
   */
  updateMap() {
    const dynamicMapContainer = document.querySelector("#map");
    if (dynamicMapContainer === null) {
      console.error(
        new Error("No element with the id 'map' found in the DOM.")
      );
    }

    if (dynamicMapContainer.style.display === "") {
      this.createStaticMapImageElement();
      return this;
    }

    this.updateMarkers();
    return this;
  }
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  new IndexPage().fetchFilters();
});
