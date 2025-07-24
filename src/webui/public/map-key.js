// DO NOT COMMIT THIS FILE TO VERSION CONTROL
// This file injects the AMap JSAPI script with your API key.
// Add 'src/webui/public/map-key.js' to your .gitignore!

(function () {
  var key = ''; // <-- Replace with your actual key, keep this file local only
  var script = document.createElement('script');
  script.src = 'https://webapi.amap.com/maps?v=2.0&key=' + key;
  script.async = true;
  script.onload = function () {
    if (window.initMap) window.initMap();
  };
  document.head.appendChild(script);
})();
