export function assert(condition, msg) {
  if (condition) throw new Error(msg);
}

/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * gcoord.isNumber(123)
 * //=true
 * gcoord.isNumber('foo')
 * //=false
 */
export function isNumber(num) {
  return !isNaN(num) && num !== null && !isArray(num);
}

/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * gcoord.isObject({elevation: 10})
 * //=true
 * gcoord.isObject('foo')
 * //=false
 */
export function isObject(input) {
  return (!!input) && (input.constructor === Object);
}

/**
 * isNumber
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 */
export function isArray(input) {
  return (!!input) && Object.prototype.toString.call(input) === '[object Array]';
}

/**
 * compose
 *
 * @param {function} function
 * @returns {function}
 */
export function compose(...funcs) {
  const start = funcs.length - 1;
  return function (...args) {
    let i = start;
    let result = funcs[start].apply(this, args);
    while (i--) result = funcs[i].call(this, result);
    return result;
  };
}

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 * https://github.com/Turfjs/turf/blob/master/packages/turf-meta/index.mjs
 *
 * @name coordEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {void}
 * @example
 * let features = gcoord.featureCollection([
 *   gcoord.point([26, 37], {"foo": "bar"}),
 *   gcoord.point([36, 53], {"hello": "world"})
 * ]);
 *
 * gcoord.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
/* eslint-disable no-param-reassign */
export function coordEach(geojson, callback, excludeWrapCoord) {
  // Handles null Geometry -- Skips this GeoJSON
  if (geojson === null) return;
  /* eslint-disable-next-line */
    let j, k, l, geometry, stopG, coords,
    geometryMaybeCollection,
    wrapShrink = 0,
    coordIndex = 0,
    isGeometryCollection;

  const type = geojson.type;
  const isFeatureCollection = type === 'FeatureCollection';
  const isFeature = type === 'Feature';
  const stop = isFeatureCollection ? geojson.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (let featureIndex = 0; featureIndex < stop; featureIndex++) {
    geometryMaybeCollection = (isFeatureCollection ? geojson.features[featureIndex].geometry
      : (isFeature ? geojson.geometry : geojson));
    isGeometryCollection = (geometryMaybeCollection) ? geometryMaybeCollection.type === 'GeometryCollection' : false;
    stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

    for (let geomIndex = 0; geomIndex < stopG; geomIndex++) {
      let multiFeatureIndex = 0;
      let geometryIndex = 0;
      geometry = isGeometryCollection
        ? geometryMaybeCollection.geometries[geomIndex] : geometryMaybeCollection;

      // Handles null Geometry -- Skips this geometry
      if (geometry === null) continue;
      coords = geometry.coordinates;
      const geomType = geometry.type;

      wrapShrink = (excludeWrapCoord && (geomType === 'Polygon' || geomType === 'MultiPolygon')) ? 1 : 0;
      switch (geomType) {
        case null:
          break;
        case 'Point':
          if (callback(coords, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
          coordIndex++;
          multiFeatureIndex++;
          break;
        case 'LineString':
        case 'MultiPoint':
          for (j = 0; j < coords.length; j++) {
            if (callback(coords[j], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
            coordIndex++;
            if (geomType === 'MultiPoint') multiFeatureIndex++;
          }
          if (geomType === 'LineString') multiFeatureIndex++;
          break;
        case 'Polygon':
        case 'MultiLineString':
          for (j = 0; j < coords.length; j++) {
            for (k = 0; k < coords[j].length - wrapShrink; k++) {
              if (callback(coords[j][k], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
              coordIndex++;
            }
            if (geomType === 'MultiLineString') multiFeatureIndex++;
            if (geomType === 'Polygon') geometryIndex++;
          }
          if (geomType === 'Polygon') multiFeatureIndex++;
          break;
        case 'MultiPolygon':
          for (j = 0; j < coords.length; j++) {
            geometryIndex = 0;
            for (k = 0; k < coords[j].length; k++) {
              for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                if (callback(coords[j][k][l], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                coordIndex++;
              }
              geometryIndex++;
            }
            multiFeatureIndex++;
          }
          break;
        case 'GeometryCollection':
          for (j = 0; j < geometry.geometries.length; j++) { if (coordEach(geometry.geometries[j], callback, excludeWrapCoord) === false) return false; }
          break;
        default:
          throw new Error('Unknown Geometry Type');
      }
    }
  }
}
