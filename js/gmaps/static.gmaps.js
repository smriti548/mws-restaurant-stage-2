let mapContainer = document.querySelector(".map-container");
let staticMapContainer = document.querySelector("#static-map");

class StaticMapGenerator {
  constructor() {
    //only when the map is on top of the list
    //WARNING: Google Static API accepts only int values for the width and height.
    this.imageWidth = mapContainer.offsetWidth;
    this.imageHeight = window.innerHeight;
    //natural size: https://developers.google.com/maps/documentation/maps-static/intro#scale_values
    this.imageScale = 1;
    this.defaultZoom = 10;
  }

  static get staticApiBaseUrl() {
    return "https://maps.googleapis.com/maps/api/staticmap";
  }
  static get widthHeightRatioNarrow() {
    return 0.4;
  }
  static get widthHeightRatioWide() {
    return 1.2;
  }
  static get maxWidthForFreeApiPlan() {
    return 640;
  }

  /**
   * Google Static Api limits the width to 640px!
   * See: https://developers.google.com/maps/documentation/maps-static/intro#Imagesizes
   */
  doesWindowWidthExceedFreePlan() {
    return window.innerWidth > StaticMapGenerator.maxWidthForFreeApiPlan;
  }

  isWindowWidthUnderTabletBreakPoint() {
    return window.innerWidth < 650;
  }

  /**
   * Calculate the image height in pixels using the given ratio.
   * @param {float} ratio | StaticMapGenerator.widthHeightRatio
   */
  getImageHeightInPx(ratio, useApiWidhtLimitConst = true) {
    const maxWidth = useApiWidhtLimitConst
      ? StaticMapGenerator.maxWidthForFreeApiPlan
      : window.innerWidth;

    //console.log("ratio", ratio);
    const calculatedHeight = parseInt(
      maxWidth * (window.innerHeight * ratio) / window.innerWidth
    );

    //console.log(calculatedHeight);
    return calculatedHeight;
  }
  buildMarkers(restaurants) {
    let markersConfigStr = "markers=color:red%7C";
    let iterator = 1;
    restaurants.forEach(restaurant => {
      // console.log(
      //   `Coordinates for ${restaurant.name} are : lat = ${
      //     restaurant.latlng.lat
      //   } ; lng = ${restaurant.latlng.lng}`
      // );
      iterator += 1;
      markersConfigStr += `${restaurant.latlng.lat},${restaurant.latlng.lng}`;
      if (restaurants.length >= iterator) {
        //add the pipe character after all coordinates except the last.
        markersConfigStr += "%7C";
      }
    });
    return markersConfigStr;
  }
  /**
   * Get the Google Maps Static API Url to generate the image.
   * The center is defined by CENTER_LATITUDE and CENTER_LONGITUDE constants.
   */
  getApiUrl(restaurants) {
    if (this.doesWindowWidthExceedFreePlan()) {
      this.imageHeight = this.getImageHeightInPx(
        StaticMapGenerator.widthHeightRatioNarrow
      );
      this.imageScale = 2;
    }
    if (this.isWindowWidthUnderTabletBreakPoint()) {
      this.imageWidth = window.innerWidth;
      this.imageHeight = this.getImageHeightInPx(
        StaticMapGenerator.widthHeightRatioNarrow,
        false
      );
      this.defaultZoom = 11;
    }
    const markersStr = this.buildMarkers(restaurants);

    const apiUrl = `${
      StaticMapGenerator.staticApiBaseUrl
    }?${markersStr}&scale=${this.imageScale}&zoom=${this.defaultZoom}&size=${
      this.imageWidth
    }x${this.imageHeight}&key=${STATIC_API_KEY}`;

    return apiUrl;
  }
  getApiUrlForRestaurant(restaurant) {
    this.defaultZoom = 16;
    if (this.doesWindowWidthExceedFreePlan()) {
      this.imageHeight = this.getImageHeightInPx(
        StaticMapGenerator.widthHeightRatioWide
      );
      this.imageScale = 2;
    }
    if (this.isWindowWidthUnderTabletBreakPoint()) {
      this.imageWidth = window.innerWidth;
      this.imageHeight = parseInt(
        this.imageWidth * StaticMapGenerator.widthHeightRatioNarrow
      );
    }
    const markersStr = this.buildMarkers([restaurant]);
    const apiUrl = `${
      StaticMapGenerator.staticApiBaseUrl
    }?${markersStr}&scale=${this.imageScale}&zoom=${this.defaultZoom}&size=${
      this.imageWidth
    }x${this.imageHeight}&key=${STATIC_API_KEY}`;

    console.log(apiUrl);
    return apiUrl;
  }
}

const dynamicMapContainer = document.getElementById("map");

mapContainer.addEventListener("click", () => {
  dynamicMapContainer.style.display = "block";
  staticMapContainer.style.display = "none";
});
mapContainer.addEventListener("mouseover", () => {
  dynamicMapContainer.style.display = "block";
  staticMapContainer.style.display = "none";
});
