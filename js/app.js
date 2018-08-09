function isBrowserCompatiblewithServiceWorkers() {
  if (!navigator.serviceWorker) {
    console.warn("ServiceWorker is not compatible with this browser...");
    return false;
  }

  return true;
}
function registerServiceWorker() {
  if (!isBrowserCompatiblewithServiceWorkers()) {
    return;
  }
  if (DEBUG) console.log("ServiceWorker is compatible with this browser!");
  navigator.serviceWorker.register("sw.js").then(
    registration => {
      // Registration was successful
      if (DEBUG)
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
    },
    function(err) {
      if (DEBUG) console.log("ServiceWorker registration failed: ", err);
    }
  );
}

function checkServiceWorkerController() {
  if (!isBrowserCompatiblewithServiceWorkers()) {
    return;
  }
  let swStatus = document.querySelector("#jsServiceWorkerStatus");
  let statusSpan = document.createElement("span");
  if (navigator.serviceWorker.controller) {
    statusSpan.className = "c-sw-ok";
  } else {
    statusSpan.className = "c-sw-nok";
  }
  swStatus.appendChild(statusSpan);
}
window.addEventListener("load", () => {
  //openDatabase();
  registerServiceWorker();
  checkServiceWorkerController();
  let homeLinks = document.querySelectorAll(".jsHomeLink");
  for (const link of homeLinks) {
    link.href = "./";
  }
  checkIfOffline();
});
/**
 * Check that there is no connectivity by doing a network fetch on a resource that the service worker doesn't catch ;)
 * Then display a custom message in place of the map container.
 */
function checkIfOffline() {
  this.fetch("./offline.html").catch(response => {
    if (response.name === "TypeError") {
      //Show the placeholder and hide the map element
      let mapOfflineMsgBlock = document.querySelector(
        ".map-offline-placeholder"
      );
      let mapBlock = document.querySelector("#map");
      let mapStaticBlock = document.querySelector("#static-map");
      if (mapOfflineMsgBlock != null && mapBlock != null) {
        mapBlock.style.display = "none";
        mapStaticBlock.style.display = "none";
        mapOfflineMsgBlock.style.display = "block";
      }
    }
  });
}
