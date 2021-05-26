import {
  GeoJSON,
  Feature,
  FeatureCollection,
  GeometryCollection,
  Point,
  LineString,
  MultiPoint,
  Polygon,
  MultiLineString,
  MultiPolygon,
} from './geojson';

export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) throw new Error(msg);
}

/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * isObject({elevation: 10})
 * //=true
 * isObject('foo')
 * //=false
 */
export function isObject(input: any): input is object {
  return !!input && input.constructor === Object;
}

/**
 * isArray
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 */
export function isArray(input: any): input is any[] {
  return !!input && Object.prototype.toString.call(input) === '[object Array]';
}

/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * isNumber(123)
 * //=true
 * isNumber('foo')
 * //=false
 */
export function isNumber(input: any): input is number {
  return !isNaN(Number(input)) && input !== null && !isArray(input);
}

/**
 * isString
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 */
export function isString(input: any): input is string {
  return typeof input === 'string';
}

/**
 * compose
 *
 * @param {function[]} functions
 * @returns {function}
 */
export function compose(...funcs: Function[]) {
  const start = funcs.length - 1;
  /* eslint-disable func-names */
  return function (...args: any[]) {
    let i = start;
    let result = funcs[start].apply(null, args);
    while (i--) result = funcs[i].call(null, result);
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
 * let features = featureCollection([
 *   point([26, 37], {"foo": "bar"}),
 *   point([36, 53], {"hello": "world"})
 * ]);
 *
 * coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
/* eslint-disable no-param-reassign */
export function coordEach(
  geojson: GeoJSON,
  callback: Function,
  excludeWrapCoord = false
): boolean | void | never {
  // Handles null Geometry -- Skips this GeoJSON
  if (geojson === null) return;
  /* eslint-disable-next-line */
  let j,
    k,
    l,
    geometry,
    stopG,
    coords,
    geometryMaybeCollection,
    wrapShrink = 0,
    coordIndex = 0,
    isGeometryCollection;

  const { type } = geojson;
  const isFeatureCollection = type === 'FeatureCollection';
  const isFeature = type === 'Feature';
  const stop = isFeatureCollection
    ? (<FeatureCollection>geojson).features.length
    : 1;

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
    geometryMaybeCollection = isFeatureCollection
      ? (<FeatureCollection>geojson).features[featureIndex].geometry
      : isFeature
      ? (<Feature>geojson).geometry
      : geojson;
    isGeometryCollection = geometryMaybeCollection
      ? geometryMaybeCollection.type === 'GeometryCollection'
      : false;
    stopG = isGeometryCollection
      ? (<GeometryCollection>geometryMaybeCollection).geometries.length
      : 1;

    for (let geomIndex = 0; geomIndex < stopG; geomIndex++) {
      let multiFeatureIndex = 0;
      let geometryIndex = 0;
      geometry = isGeometryCollection
        ? (<GeometryCollection>geometryMaybeCollection).geometries[geomIndex]
        : geometryMaybeCollection;

      // Handles null Geometry -- Skips this geometry
      if (geometry === null) continue;
      const geomType = geometry.type;

      wrapShrink =
        excludeWrapCoord &&
        (geomType === 'Polygon' || geomType === 'MultiPolygon')
          ? 1
          : 0;
      switch (geomType) {
        case null:
          break;
        case 'Point':
          coords = (<Point>geometry).coordinates;
          if (
            callback(
              coords,
              coordIndex,
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            ) === false
          )
            return false;
          coordIndex++;
          multiFeatureIndex++;
          break;
        case 'LineString':
        case 'MultiPoint':
          coords = (<LineString | MultiPoint>geometry).coordinates;
          for (j = 0; j < coords.length; j++) {
            if (
              callback(
                coords[j],
                coordIndex,
                featureIndex,
                multiFeatureIndex,
                geometryIndex
              ) === false
            )
              return false;
            coordIndex++;
            if (geomType === 'MultiPoint') multiFeatureIndex++;
          }
          if (geomType === 'LineString') multiFeatureIndex++;
          break;
        case 'Polygon':
        case 'MultiLineString':
          coords = (<Polygon | MultiLineString>geometry).coordinates;
          for (j = 0; j < coords.length; j++) {
            for (k = 0; k < coords[j].length - wrapShrink; k++) {
              if (
                callback(
                  coords[j][k],
                  coordIndex,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                return false;
              coordIndex++;
            }
            if (geomType === 'MultiLineString') multiFeatureIndex++;
            if (geomType === 'Polygon') geometryIndex++;
          }
          if (geomType === 'Polygon') multiFeatureIndex++;
          break;
        case 'MultiPolygon':
          coords = (<MultiPolygon>geometry).coordinates;
          for (j = 0; j < coords.length; j++) {
            geometryIndex = 0;
            for (k = 0; k < coords[j].length; k++) {
              for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                if (
                  callback(
                    coords[j][k][l],
                    coordIndex,
                    featureIndex,
                    multiFeatureIndex,
                    geometryIndex
                  ) === false
                )
                  return false;
                coordIndex++;
              }
              geometryIndex++;
            }
            multiFeatureIndex++;
          }
          break;
        case 'GeometryCollection':
          for (
            j = 0;
            j < (<GeometryCollection>geometry).geometries.length;
            j++
          ) {
            if (
              coordEach(
                (<GeometryCollection>geometry).geometries[j],
                callback,
                excludeWrapCoord
              ) === false
            )
              return false;
          }
          break;
        default:
          throw new Error('Unknown Geometry Type');
      }
    }
  }
}
