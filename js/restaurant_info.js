class RestaurantPage {
  constructor(map) {
    this.map = map;
    this.restaurant = null;
  }
  /**
   * Set the restaurant property.
   * @param {*} restaurant
   */
  setRestaurant(restaurant) {
    this.restaurant = restaurant;
    return this;
  }
  /**
   * Reads the ID of the restaurant.
   */
  getRestaurantId() {
    const id = this.getParameterByName("id");
    if (!id) {
      // no id found in URL
      const error = "No restaurant id in URL";
      throw error;
    }

    return parseInt(id);
  }
  /**
   * Get current restaurant from page URL.
   */
  loadRestaurantFromURL() {
    const restaurantId = this.getRestaurantId();
    fetchRestaurant(restaurantId)
      .then(restaurant => {
        if (!restaurant) {
          return false;
        }
        this.setRestaurant(restaurant)
          .hideLoadingScreen()
          .fillRestaurantHTML()
          .createStaticMapImageElement();
      })
      .catch(err => {
        console.error(err);
      });
  }
  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML() {
    this.fillBreadcrumb();
    const restaurantContainer = document.querySelector(
      ".restaurant-details-container"
    );
    restaurantContainer.style.display = "block";
    const name = document.getElementById("restaurant-name");
    name.innerHTML = `At ${this.restaurant.name}`;
    const cuisine = document.getElementById("restaurant-cuisine");
    cuisine.innerHTML = `is served <i>${
      this.restaurant.cuisine_type
    }</i> cuisine`;
    const address = document.getElementById("restaurant-address");
    address.innerHTML = `and is located at:<p><i>${
      this.restaurant.address
    }</i></p>`;
    const image = document.getElementById("restaurant-img");
    image.alt = `${this.restaurant.name} restaurant, ${
      this.restaurant.shortDesc
    }`;
    image.src = imageUrlForRestaurant(this.restaurant, 360, true);
    image.srcset = this.buildSrcSet(this.restaurant);
    //image.setAttribute("data-sizes", "auto");
    //image.setAttribute("data-src", buildDataSrc(restaurant));
    //image.setAttribute("data-srcset", buildDataSrcSet(restaurant));
    // fill operating hours
    if (this.restaurant.operating_hours) {
      this.fillRestaurantHoursHTML(this.restaurant.operating_hours);
    }
    // fill reviews
    this.fillReviewsHTML(this.restaurant.reviews);

    return this;
  }
  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML(operatingHours) {
    const hours = document.getElementById("restaurant-hours-table");
    for (let key in operatingHours) {
      const row = document.createElement("tr");
      const day = document.createElement("td");
      day.innerHTML = `${key}: `;
      row.appendChild(day);
      const time = document.createElement("td");
      time.innerHTML = operatingHours[key];
      row.appendChild(time);
      hours.appendChild(row);
    }
  }
  /**
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML(reviews) {
    const container = document.getElementById("reviews-container");
    const title = document.createElement("h3");
    title.innerHTML = "Reviews";
    container.appendChild(title);
    if (!reviews) {
      const noReviews = document.createElement("p");
      noReviews.innerHTML = "No reviews yet!";
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById("reviews-list");
    reviews.forEach(review => {
      ul.appendChild(this.createReviewHTML(review));
    });
    container.appendChild(ul);
  }
  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const li = document.createElement("li");
    const date = document.createElement("p");
    date.className = "review-date";
    date.innerHTML = `Published: ${review.date}`;
    li.appendChild(date);
    const name = document.createElement("h4");
    name.className = "review-author";
    name.tabIndex = "0"; //To help go through the review list using the keyboard.
    name.innerHTML = `Review of ${review.name}`;
    li.appendChild(name);
    const rating = document.createElement("p");
    rating.className = "review-rating";
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);
    const comments = document.createElement("p");
    comments.className = "review-comments";
    comments.innerHTML = review.comments;
    li.appendChild(comments);
    return li;
  }
  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb(restaurant) {
    const breadcrumb = document.getElementById("breadcrumb");
    const li = document.createElement("li");
    const currentPage = document.createElement("a");
    currentPage.href = "#";
    currentPage.title = `${this.restaurant.name} restaurant details`;
    currentPage.setAttribute("aria-current", "page");
    currentPage.innerHTML = this.restaurant.name;
    li.appendChild(currentPage);
    breadcrumb.appendChild(this.addHomeLink());
    breadcrumb.appendChild(li);
  }
  /**
   *
   */
  addHomeLink() {
    const homeLi = document.createElement("li");
    homeLi.innerHTML = `<li><a class="jsHomeLink" title="Navigate to the Home page" href="./">Home</a></li>`;
    return homeLi;
  }
  /**
   * Get a parameter by name from page URL.
   */
  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  /**
   * Build the string value of the srcset attribute of an image element.
   * @param {restaurant} restaurant
   */
  buildDataSrc(restaurant) {
    const img360w = imageUrlForRestaurant(restaurant, 360);
    const dataSrcVal = `${img360w}`;
    return dataSrcVal;
  }
  /**
   * Build the string value of the srcset attribute of an image element.
   * @param {restaurant} restaurant
   */
  buildSrcSet(restaurant) {
    const img360w = imageUrlForRestaurant(restaurant, 360);
    const img480w = imageUrlForRestaurant(restaurant, 480);
    const imgOriginalImproved = imageUrlForRestaurant(restaurant);
    const srcSetVal = `${img360w} 360w, ${img480w} 480w, ${imgOriginalImproved} 800w`;
    return srcSetVal;
  }

  /**
   * Adds the marker to the restaurant's coordinates on the map.
   */
  addMarkerToMap(callback) {
    const restaurantId = this.getRestaurantId();
    return fetchRestaurant(restaurantId)
      .then(restaurant => {
        if (!restaurant) {
          return;
        }
        return restaurant;
      })
      .catch(err => {
        console.error(err);
      });
  }
  /**
   * Load the static Google Maps image.
   */
  createStaticMapImageElement() {
    let staticMapContainer = document.querySelector("#static-map");
    const staticMapImg = document.createElement("img");
    staticMapImg.alt = `Location of ${
      this.restaurant.name
    }. Hover or click to view the dynamic map.`;
    staticMapImg.src = new StaticMapGenerator(
      "restaurant"
    ).getApiUrlForRestaurant(this.restaurant);
    staticMapContainer.appendChild(staticMapImg);
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
}
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  new RestaurantPage().loadRestaurantFromURL();
});
