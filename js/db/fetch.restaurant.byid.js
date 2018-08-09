/**
 * Fetch the restaurant from:
 *   - the cache first
 *   - if not present in cache, which can happen if the link has been crawled, fetch the api and cache the result
 *   - if present in cache, still fetch the api for an update.
 * @param {int} id
 */
function fetchRestaurant(id) {
  return getCacheItem(id)
    .then(restaurant => {
      if (restaurant === undefined || restaurant === null) {
        var apiPromise = fetchRestaurantFromApi(id);
        return Promise.all(apiPromise).then(apiResponse => {
          return apiPromise; //already cached in fetchRestaurantFromApi
        });
      }
      fetchRestaurantFromApi(id); //call the api that will update the cache db.
      return restaurant;
    })
    .catch(err => {
      console.error(err);
    });
}

/**
 * Fetch a restaurant by its ID from the API.
 * @param {int} id
 */
function fetchRestaurantFromApi(id) {
  const DATABASE_URL = `http://localhost:1337/restaurants/${id}`;
  fetch(DATABASE_URL)
    .then(function(response) {
      if (response.ok) {
        const jsonData = response.json();
        console.log(jsonData);
        return jsonData;
      }
      if (DEBUG) console.log("Fetch failed response", response);
    })
    .then(restaurant => {
      cacheItem(restaurant)
        .then(response => {
          if (DEBUG)
            console.log(
              `Just updated restaurant ID ${restaurant.id}`,
              response
            );
          return restaurant;
        })
        .catch(err => {
          console.error(
            `Failed to cache the restaurant ID ${restaurant.id}in cache`,
            err
          );
          return false;
        });
    })
    .catch(err => {
      return "Visit the home page!";
    });
}
