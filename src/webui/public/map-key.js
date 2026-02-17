// DO NOT COMMIT THIS FILE TO VERSION CONTROL
// This file injects the AMap JSAPI script with your API key.
// Add 'src/webui/public/map-key.js' to your .gitignore!

(function () {
  var tdtKey = '';
  var tdtScript = document.createElement('script');
  tdtScript.src = 'http://api.tianditu.gov.cn/api?v=4.0&tk=' + tdtKey;
  tdtScript.async = true;
  tdtScript.onload = function () {
    if (window.initTDTMap) {
      window.initTDTMap();
      console.log('TDTMap loaded');
    } else {
      console.log('TDTMap not loaded');
    }
  };
  document.head.appendChild(tdtScript);

  var key = ''; // <-- Replace with your actual key, keep this file local only
  var script = document.createElement('script');
  script.src = 'https://webapi.amap.com/maps?v=2.0&key=' + key;
  script.async = true;
  script.onload = function () {
    if (window.initAMap) window.initAMap();
    console.log('AMap initAMap called');
  };
  document.head.appendChild(script);
})();
