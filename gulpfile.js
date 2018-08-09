/*eslint-env node */

const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const babel = require("gulp-babel");

/**
 * ESlint task checks the javascript files found in ./js folder and subfolders.
 * The lazysizes files and node_modules are excluded.
 */
const eslint = require("gulp-eslint");
gulp.task("js-lint", () => {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return (
    gulp
      .src([
        "./js/*.js",
        "!node_modules/**",
        "!js/lazysizes**",
        "!build/js/io.min.js"
      ])
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(eslint())
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError())
  );
});

/**
 * Copy the any files at the root of the project into the root of build folder
 */
gulp.task("copy-root", () => {
  gulp
    .src([
      "./sw.js",
      "./favicon.ico",
      "./site.webmanifest",
      "./browserconfig.xml"
    ])
    .pipe(gulp.dest("./build"));
});
/**
 * Copy the html source files into the root of build folder
 */
gulp.task("copy-html", () => {
  gulp
    .src(["./index.html", "./restaurant.html", "./offline.html"])
    .pipe(gulp.dest("./build"));
});

/**
 * Copy the icons into the build folder
 */
gulp.task("copy-icons", () => {
  gulp
    .src(["./img/icons/*.svg", "./img/icons/*.png"])
    .pipe(gulp.dest("./build/img/icons"));
});

/**
 * Copy the image placeholders into the build folder
 */
gulp.task("copy-img-ph", () => {
  //As long as the svg files are the image placeholders, this is fine.
  gulp.src("./img/*.svg").pipe(gulp.dest("./build/img"));
});

/**
 * Copy the json data file into the build folder
 */

gulp.task("copy-static-data", () => {
  gulp.src(["./data/restaurants.json"]).pipe(gulp.dest("./build/data"));
});

/**
 * Run the copy tasks of the static assets into one task.
 */
gulp.task("copy-static-assets", [
  "copy-root",
  "copy-html",
  "copy-icons",
  "copy-img-ph",
  "copy-static-data"
]);

/**
 * Images task takes care of transforming the original images into the optimised images and creates the requested sizes for better responsiveness
 */
const $ = require("gulp-load-plugins")();
gulp.task("optim-images", () => {
  return gulp
    .src("img/*.{jpg,png}")
    .pipe(
      $.responsive(
        {
          // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
          "*.jpg": [
            { width: 64, rename: { suffix: "-64w" } },
            { width: 128, rename: { suffix: "-128w" } },
            { width: 360, rename: { suffix: "-360w" } },
            { width: 480, rename: { suffix: "-480w" } },
            {
              // Compress, strip metadata, and rename original image //used for the index.html across all viewports // //used for the index.html across all viewports
              rename: { suffix: "-800w" }
            }
          ]
        },
        {
          // Global configuration for all images
          // The output quality for JPEG, WebP and TIFF output formats
          quality: 70,
          progressive: true,
          withMetadata: false
        }
      )
    ) // Use progressive (interlace) scan for JPEG and PNG output // Strip all metadata
    .pipe(gulp.dest("build/img"));
});

/**
 * Optimize the css by:
 *     - adding the browser specific prefixes.
 *     - minifying the css.
 */
const pump = require("pump");
const autoprefixer = require("gulp-autoprefixer");
const uglifycss = require("gulp-uglifycss");
gulp.task("optim-css", callback => {
  pump(
    [
      gulp.src("css/**/*.css"),
      autoprefixer(),
      uglifycss({
        maxLineLen: 80,
        uglyComments: true
      }),
      concat("styles.css"),
      gulp.dest("build/css")
    ],
    callback
  );
});

/**
 * Generate the critical css and inline it in the pages
 */
const critical = require("critical");
gulp.task("critical-css", ["optim-css"], function() {
  critical
    .generate({
      inline: true,
      base: "./build",
      src: "index.html",
      dest: "index.html",
      minify: true,
      width: 320,
      height: 480
    })
    .catch(err => {
      console.error("gulp task critical failed", err);
    });
});

/**
 * Optimize the javascript for the index page by:
 *     - declaring the files in the proper order.
 *     - minifying the javascript code.
 */
let uglify = require("gulp-uglify-es").default;
/**
 * jsCommonFiles is the list of javascript files that are common to both index and restaurant pages.
 */
let jsCommonFiles = [
  "./node_modules/idb-keyval/dist/idb-keyval-iife.js", //Idb with promise library
  "./js/lib/debug.js", //Idb with promise library
  "./js/lib/helpers.js",
  "./js/db/cache.request.js",
  "./js/app.js",
  "./js/lazysizes.min.js",
  "./js/gmaps/constants.js",
  "./js/gmaps/static.gmaps.js",
  "./js/gmaps/lazyload.gmaps.js",
  "./js/focus.handler.js"
];

let jsFilesIndexPage = [
  "./js/db/fetch.restaurants.js",
  "./js/db/filters.js",
  "./js/select.change.handler.js",
  "./js/main.js"
];

const finalJsFilesIndexPage = [...jsCommonFiles, ...jsFilesIndexPage];
//console.log("JS files to optimise for index page", finalJsFilesIndexPage);
gulp.task("optim-js-index-page", callback => {
  pump(
    [
      gulp.src(finalJsFilesIndexPage),
      sourcemaps.init(),
      babel(),
      concat("index.bundle.js"),
      uglify(),
      rename("index.bundle.min.js"),
      sourcemaps.write(),
      gulp.dest("build/js")
    ],
    callback
  );
});
gulp.task("live-optim-js-index-page", callback => {
  pump(
    [
      gulp.src(finalJsFilesIndexPage),
      babel(),
      concat("index.bundle.js"),
      uglify(),
      rename("index.bundle.min.js"),
      gulp.dest("build/js")
    ],
    callback
  );
});

/**
 * Optimize the javascript for the restaurant page by:
 *     - declaring the files in the proper order.
 *     - minifying the javascript code.
 */
let jsFilesRestaurantPage = [
  "./js/db/fetch.restaurant.byid.js",
  "./js/restaurant_info.js"
];
const finalJsFilesRestaurantPage = [...jsCommonFiles, ...jsFilesRestaurantPage];
//console.log("JS files to optimise for index page", finalJsFilesRestaurantPage);
gulp.task("optim-js-restaurant-page", callback => {
  pump(
    [
      gulp.src(finalJsFilesRestaurantPage),
      sourcemaps.init(),
      babel(),
      concat("restaurant.bundle.js"),
      uglify(),
      rename("restaurant.bundle.min.js"),
      sourcemaps.write(),
      gulp.dest("build/js")
    ],
    callback
  );
});
gulp.task("live-optim-js-restaurant-page", callback => {
  pump(
    [
      gulp.src(finalJsFilesRestaurantPage),
      babel(),
      concat("restaurant.bundle.js"),
      uglify(),
      rename("restaurant.bundle.min.js"),
      gulp.dest("build/js")
    ],
    callback
  );
});

/**
 * Minify the intersection observer library and put it the build folder
 */
const intersectionObserverFile =
  "./node_modules/intersection-observer/intersection-observer.js";
//console.log("JS files to optimise for index page", finalJsFilesRestaurantPage);
gulp.task("optim-js-io", callback => {
  pump(
    [
      gulp.src(intersectionObserverFile),
      //sourcemaps.init(),
      uglify(),
      rename("io.min.js"),
      //sourcemaps.write(),
      gulp.dest("build/js")
    ],
    callback
  );
});
/**
 * Task to copy the javascript unoptimized in development.
 */
gulp.task("copy-scripts", () => {
  gulp
    .src([
      ...jsCommonFiles,
      ...jsFilesIndexPage,
      ...jsFilesRestaurantPage,
      ...intersectionObserverFile
    ])
    .pipe(gulp.dest("./build"));
});

/**
 * Task to optimize the javascript scripts when deploying the application
 */
gulp.task("scripts", [
  "optim-js-index-page",
  "optim-js-restaurant-page",
  "optim-js-io"
]);
gulp.task("live-scripts", [
  "live-optim-js-index-page",
  "live-optim-js-restaurant-page",
  "optim-js-io"
]);
/**
 * Default gulp task for development environnement that includes:
 *     - copying all the static files
 *     - optimize the images
 *     - optimize the css
 *     - optimize the javascript
 */
//https://stackoverflow.com/a/28460016
//const compress = require("compression");
//const browserSync = require("browser-sync").create();
gulp.task(
  "default",
  [
    //"js-lint",
    "copy-static-assets",
    "optim-images",
    "optim-css",
    //"critical-css",
    "scripts"
  ],
  () => {
    gulp.watch("./*.js", ["copy-root"]);
    gulp.watch("./js/**/*.js", ["scripts"]);
    gulp.watch("./css/**/*.css", ["optim-css"]);
    gulp.watch("./**/*.html", ["copy-html"]);
  }
);

/**
 * Default gulp task for development environnement that includes:
 *     - copying all the static files
 *     - optimize the images
 *     - optimize the css
 *     - optimize the javascript
 */
gulp.task("go-live", [
  //"js-lint",
  "copy-static-assets",
  "optim-images",
  "critical-css",
  "live-scripts"
]);
