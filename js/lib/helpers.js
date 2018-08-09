/**
 * Restaurant page URL.
 */
function urlForRestaurant(restaurant) {
  if (!restaurant) {
    console.error(
      "Restaurant is null. Cannot build the URL to information page"
    );
    return;
  }

  return `./restaurant.html?id=${restaurant.id}`;
}
/**
 * Restaurant image URL
 * @param {Object} restaurant
 * @param {int|null} imgWidth
 * @param {bool} usePlaceholder
 */
function imageUrlForRestaurant(
  restaurant,
  imgWidth = 800,
  usePlaceholder = false
) {
  if (!restaurant) {
    console.error("Restaurant is null. Cannot build the image URL");
    return;
  }

  if (usePlaceholder) {
    return `./img/img-ph-${imgWidth}w.svg`;
  }

  if (restaurant.id === null) {
    return `./img/missing-${imgWidth}w.svg`;
  }
  const imgFolderPath = "./img/";
  return `${imgFolderPath}${restaurant.id}-${imgWidth}w.jpg`;
}
