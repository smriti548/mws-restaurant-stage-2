class MapsMarker {
  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
// let displayGmaps = document.querySelector(".display-gmaps");
// let hideGmaps = document.querySelector(".hide-gmaps");

// if (displayGmaps !== null) {
//   displayGmaps.addEventListener("click", () => {
//     displayGmaps.style.display = "none";
//     hideGmaps.style.display = "inline-block";
//     const mapContainer = document.querySelector("#map");
//     mapContainer.style.display = "block";
//   });
// }
// if (hideGmaps !== null) {
//   hideGmaps.addEventListener("click", () => {
//     hideGmaps.style.display = "none";
//     displayGmaps.style.display = "inline-block";
//     const mapContainer = document.querySelector("#map");
//     mapContainer.style.display = "none";
//   });
// }

/* Licence Creative Commons Attribution 4.0 International License - Walter Ebert (https://walterebert.com/blog/lazy-loading-google-maps-with-the-intersection-observer-api/) */
function google_maps_init_on_index() {
  "use strict";

  let loc = {
    lat: CENTER_LATITUDE,
    lng: CENTER_LONGITUDE
  };
  self.map = new google.maps.Map(document.getElementById("map"), {
    zoom: 11,
    center: loc,
    scrollwheel: false
  });
  new IndexPage(self.map).updateMarkers();
}

function google_maps_init_on_restopage() {
  ("use strict");

  new RestaurantPage()
    .addMarkerToMap()
    .then(restaurant => {
      if (!restaurant) {
        return;
      }

      self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      MapsMarker.mapMarkerForRestaurant(restaurant, self.map);
    })
    .catch(err => {
      console.error(err);
    });
}
/**
 * Lazy load the Google Map.
 * @param {*} api_key
 */
function google_maps_lazyload(api_key) {
  "use strict";

  var currentPage = document.location.pathname;
  if (api_key) {
    var options = {
      rootMargin: "100px",
      threshold: 0
    };

    var map = document.getElementById("map");

    var observer = new IntersectionObserver(function(entries, self) {
      // Intersecting with Edge workaround https://calendar.perfplanet.com/2017/progressive-image-loading-using-intersection-observer-and-sqip/#comment-102838
      var isIntersecting =
        typeof entries[0].isIntersecting === "boolean"
          ? entries[0].isIntersecting
          : entries[0].intersectionRatio > 0;
      if (isIntersecting) {
        const pageSpecificGmapsLoader =
          currentPage === "/" || currentPage === "/index.html"
            ? "google_maps_init_on_index"
            : "google_maps_init_on_restopage";
        loadJS(
          `https://maps.googleapis.com/maps/api/js?callback=${pageSpecificGmapsLoader}&libraries=places&key=${api_key}`
        );
        self.unobserve(map);
      }
    }, options);

    observer.observe(map);
  }
}

google_maps_lazyload(DYNAMIC_API_KEY);
