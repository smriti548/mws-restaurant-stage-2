/**
 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
 */
function fetchRestaurantFiltered(filters) {
  // Fetch all restaurants
  return fetchRestaurants()
    .then(restaurants => {
      let results = restaurants;
      if (filters.cuisine != "all") {
        // filter by cuisine
        results = results.filter(r => r.cuisine_type == filters.cuisine);
      }
      if (filters.neighborhood != "all") {
        // filter by neighborhood
        results = results.filter(r => r.neighborhood == filters.neighborhood);
      }
      return results;
    })
    .catch(err => {
      console.error(err);
    });
}

/**
 * Fetch all neighborhoods with proper error handling.
 */
function getFilters() {
  // Fetch all restaurants
  return fetchRestaurants()
    .then(restaurants => {
      const filters = {};
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
      const neighborhoods = restaurants.map(
        (v, i) => restaurants[i].neighborhood
      );

      filters.cuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
      filters.neighborhoods = neighborhoods.filter(
        (v, i) => neighborhoods.indexOf(v) == i
      );
      return filters;
    })
    .catch(err => {
      console.error(err);
    });
}
