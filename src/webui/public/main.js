let lastCoords = null; // Store last valid coordinates

function addPolygon(mapele, data) {
  if (mapele == null) {
    return;
  }
  let polygon = new AMap.Polygon({
    path: data,
    fillColor: '#ccebc5',
    strokeOpacity: 1,
    fillOpacity: 0.5,
    strokeColor: '#2b8cbe',
    strokeWeight: 1,
    strokeStyle: 'dashed',
    strokeDasharray: [5, 5],
  });
  polygon.on('mouseover', () => {
    polygon.setOptions({
      fillOpacity: 0.7,
      fillColor: '#7bccc4',
    });
  });
  polygon.on('mouseout', () => {
    polygon.setOptions({
      fillOpacity: 0.5,
      fillColor: '#ccebc5',
    });
  });
  mapele.add(polygon);
}

function pointBBox(center, side) {
  // 计算点周围矩形的四个顶点
  const bbox = [];
  const radius = side / 2;
  const angle = Math.PI / 4; // 45度角

  // 计算四个顶点
  bbox.push([center[0] + radius, center[1] + radius]);
  bbox.push([center[0] + radius, center[1] - radius]);
  bbox.push([center[0] - radius, center[1] - radius]);
  bbox.push([center[0] - radius, center[1] + radius]);
  // bbox.push([center[0] + radius, center[1] + radius ]);

  return bbox;
}

function renderResults(coords) {
  const errorDiv = document.getElementById('error');
  const resultsDiv = document.getElementById('results');
  const gcj02Div = document.getElementById('gcj02');
  const bd09Div = document.getElementById('bd09');
  const swapOrder = document.getElementById('swapOrder').checked;
  const dmsFormat = document.getElementById('dmsFormat').checked;

  // Access the map instance that's defined in the HTML
  var hasMap = map ? true : false;

  errorDiv.style.display = 'none';
  resultsDiv.style.display = 'none';
  gcj02Div.textContent = '';
  bd09Div.textContent = '';

  try {
    const gcj02 = gcoord.transform(coords, gcoord.WGS84, gcoord.GCJ02);
    const bd09 = gcoord.transform(coords, gcoord.WGS84, gcoord.BD09);

    function toDMS(val, isLat) {
      const abs = Math.abs(val);
      const deg = Math.floor(abs);
      const minFloat = (abs - deg) * 60;
      const min = Math.floor(minFloat);
      const sec = ((minFloat - min) * 60).toFixed(3);
      if (isLat) {
        return `${deg}°${min}'${sec}\"${val < 0 ? 'S' : 'N'}`;
      } else {
        return `${deg}°${min}'${sec}\"${val < 0 ? 'W' : 'E'}`;
      }
    }

    function formatOutput(arr) {
      if (dmsFormat) {
        const lonDMS = toDMS(arr[0], false);
        const latDMS = toDMS(arr[1], true);
        return swapOrder ? `${latDMS} ${lonDMS}` : `${lonDMS} ${latDMS}`;
      } else {
        return swapOrder
          ? `${arr[1].toFixed(8)}, ${arr[0].toFixed(8)}`
          : `${arr[0].toFixed(8)}, ${arr[1].toFixed(8)}`;
      }
    }

    gcj02Div.textContent = formatOutput(gcj02);
    bd09Div.textContent = formatOutput(bd09);
    resultsDiv.style.display = 'block';

    if (hasMap) {
      var position = new AMap.LngLat(gcj02[0], gcj02[1]);
      map.setCenter(position, false, 500);
      var bbox = pointBBox(gcj02, 0.01);
      addPolygon(map, bbox);
      console.log(bbox);
      // console.log(position.toJSON());
      // console.log(map.getZoom());
    }
  } catch (err) {
    errorDiv.textContent = 'Conversion failed: ' + (err.message || err);
    errorDiv.style.display = 'block';
  }
}

document
  .getElementById('convert-form')
  .addEventListener('submit', function (e) {
    e.preventDefault();
    const input = document.getElementById('wgs84').value.trim();
    const errorDiv = document.getElementById('error');

    // Parse input
    let coords;
    try {
      coords = input.split(',').map(Number);
      if (coords.length !== 2 || coords.some(isNaN)) throw new Error();
    } catch {
      errorDiv.textContent =
        'Please enter valid coordinates in the format: longitude, latitude';
      errorDiv.style.display = 'block';
      lastCoords = null;
      return;
    }

    lastCoords = coords;
    renderResults(coords);
  });

// Add event listeners to checkboxes for live update
['swapOrder', 'dmsFormat'].forEach((id) => {
  document.getElementById(id).addEventListener('change', function () {
    if (lastCoords) {
      renderResults(lastCoords);
    }
  });
});

// SRT file upload and parsing logic
// Use gcoord.parseSrtLocus from the global gcoord object
// Remove the import statement

const srtInput = document.getElementById('srt-upload');
const srtBtn = document.getElementById('srt-upload-btn');

srtBtn &&
  srtBtn.addEventListener('click', function () {
    if (!srtInput || !srtInput.files || srtInput.files.length === 0) {
      alert('Please select a SRT file first.');
      return;
    }
    const file = srtInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const points = gcoord.parseSrtLocus(text);
      console.log('Extracted locus points:', points);
      // Convert to [[lng, lat], ...] format for addPolygon
      const polygonPoints = points.map((pt) => [pt.longitude, pt.latitude]);
      // Transform all points from WGS84 to GCJ02 in one call
      const gcj02PolygonPoints = polygonPoints.map((pt) =>
        gcoord.transform(pt, gcoord.WGS84, gcoord.GCJ02)
      );
      if (gcj02PolygonPoints.length >= 3 && typeof map !== 'undefined' && map) {
        addPolygon(map, gcj02PolygonPoints);
        // Compute center of mass
        const sum = gcj02PolygonPoints.reduce(
          (acc, pt) => [acc[0] + pt[0], acc[1] + pt[1]],
          [0, 0]
        );
        const center = [
          sum[0] / gcj02PolygonPoints.length,
          sum[1] / gcj02PolygonPoints.length,
        ];
        map.setCenter(new AMap.LngLat(center[0], center[1]), false, 500);
        console.log('Polygon points (GCJ02):', gcj02PolygonPoints);
        console.log('Center of mass:', center);
      } else {
        console.log(
          'Not enough points to form a polygon or map not available.'
        );
      }
    };
    reader.readAsText(file);
  });
