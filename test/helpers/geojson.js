import {
  assert,
  isNumber,
  isObject,
  isArray,
} from '../../src/helper.js';

// https://github.com/Turfjs/turf/blob/master/packages/turf-helpers/index.mjs

/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature} a GeoJSON Feature
 * @example
 * let geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * let feature = turf.feature(geometry);
 *
 * //=feature
 */
export function feature(geometry, properties, options) {
  // Optional Parameters
  options = options || {};
  assert(!isObject(options), 'options is invalid');
  const bbox = options.bbox;
  const id = options.id;

  // Validation
  assert(geometry === undefined, 'geometry is required');
  assert(properties && properties.constructor !== Object, 'properties must be an Object');
  if (bbox) validateBBox(bbox);
  if (id !== 0 && id) validateId(id);

  // Main
  const feat = {
    type: 'Feature',
  };
  if (id === 0 || id) feat.id = id;
  if (bbox) feat.bbox = bbox;
  feat.properties = properties || {};
  feat.geometry = geometry;
  return feat;
}

/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<number>} coordinates Coordinates
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Geometry
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * let type = 'Point';
 * let coordinates = [110, 50];
 *
 * let geometry = turf.geometry(type, coordinates);
 *
 * //=geometry
 */
export function geometry(type, coordinates, options) {
  // Optional Parameters
  options = options || {};
  assert(!isObject(options), 'options is invalid');
  const bbox = options.bbox;

  // Validation
  assert(!type, 'type is required');
  assert(!coordinates, 'coordinates is required');
  assert(!isArray(coordinates), 'coordinates must be an Array');
  if (bbox) validateBBox(bbox);

  // Main
  let geom;
  switch (type) {
    case 'Point':
      geom = point(coordinates).geometry;
      break;
    case 'LineString':
      geom = lineString(coordinates).geometry;
      break;
    case 'Polygon':
      geom = polygon(coordinates).geometry;
      break;
    case 'MultiPoint':
      geom = multiPoint(coordinates).geometry;
      break;
    case 'MultiLineString':
      geom = multiLineString(coordinates).geometry;
      break;
    case 'MultiPolygon':
      geom = multiPolygon(coordinates).geometry;
      break;
    default:
      throw new Error(`${type} is invalid`);
  }
  if (bbox) geom.bbox = bbox;
  return geom;
}

/**
 * Creates a {@link Point} {@link Feature} from a Position.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Point>} a Point feature
 * @example
 * let point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
export function point(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');
  assert(!isArray(coordinates), 'coordinates must be an Array');
  assert(coordinates.length < 2, 'coordinates must be at least 2 numbers long');
  assert(!isNumber(coordinates[0]) || !isNumber(coordinates[1]), 'coordinates must contain numbers');

  return feature({
    type: 'Point',
    coordinates,
  }, properties, options);
}

/**
 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
 *
 * @name points
 * @param {Array<Array<number>>} coordinates an array of Points
 * @param {Object} [properties={}] Translate these properties to each Feature
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Point>} Point Feature
 * @example
 * let points = turf.points([
 *   [-75, 39],
 *   [-80, 45],
 *   [-78, 50]
 * ]);
 *
 * //=points
 */
export function points(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');
  assert(!isArray(coordinates), 'coordinates must be an Array');

  return featureCollection(coordinates.map(coords => point(coords, properties)), options);
}

/**
 * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Polygon>} Polygon Feature
 * @example
 * let polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
 *
 * //=polygon
 */
export function polygon(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');

  for (let i = 0; i < coordinates.length; i++) {
    const ring = coordinates[i];
    assert(ring.length < 4, 'Each LinearRing of a Polygon must have 4 or more Positions.');
    for (let j = 0; j < ring[ring.length - 1].length; j++) {
      // Check if first point of Polygon contains two numbers
      assert(i === 0 && j === 0 && !isNumber(ring[0][0]) || !isNumber(ring[0][1]), 'coordinates must contain numbers');
      assert(ring[ring.length - 1][j] !== ring[0][j], 'First and last Position are not equivalent.');
    }
  }

  return feature({
    type: 'Polygon',
    coordinates,
  }, properties, options);
}

/**
 * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
 *
 * @name polygons
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
 * @example
 * let polygons = turf.polygons([
 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
 * ]);
 *
 * //=polygons
 */
export function polygons(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');
  assert(!isArray(coordinates), 'coordinates must be an Array');

  return featureCollection(coordinates.map(coords => polygon(coords, properties)), options);
}

/**
 * Creates a {@link LineString} {@link Feature} from an Array of Positions.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<LineString>} LineString Feature
 * @example
 * let linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
 * let linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
 *
 * //=linestring1
 * //=linestring2
 */
export function lineString(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');
  assert(coordinates.length < 2, 'coordinates must be an array of two or more positions');
  // Check if first point of LineString contains two numbers
  assert(!isNumber(coordinates[0][1]) || !isNumber(coordinates[0][1]), 'coordinates must contain numbers');

  return feature({
    type: 'LineString',
    coordinates,
  }, properties, options);
}

/**
 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
 *
 * @name lineStrings
 * @param {Array<Array<number>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
 * @example
 * let linestrings = turf.lineStrings([
 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
 * ]);
 *
 * //=linestrings
 */
export function lineStrings(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');
  assert(!isArray(coordinates), 'coordinates must be an Array');

  return featureCollection(coordinates.map(coords => lineString(coords, properties)), options);
}

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {FeatureCollection} FeatureCollection of Features
 * @example
 * let locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
 * let locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
 * let locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
 *
 * let collection = turf.featureCollection([
 *   locationA,
 *   locationB,
 *   locationC
 * ]);
 *
 * //=collection
 */
export function featureCollection(features, options) {
  // Optional Parameters
  options = options || {};
  assert(!isObject(options), 'options is invalid');
  const bbox = options.bbox;
  const id = options.id;

  // Validation
  assert(!features, 'No features passed');
  assert(!isArray(features), 'features must be an Array');
  if (bbox) validateBBox(bbox);
  if (id) validateId(id);

  // Main
  const fc = {
    type: 'FeatureCollection',
  };
  if (id) fc.id = id;
  if (bbox) fc.bbox = bbox;
  fc.features = features;
  return fc;
}

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * let multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
export function multiLineString(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');

  return feature({
    type: 'MultiLineString',
    coordinates,
  }, properties, options);
}

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * let multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
export function multiPoint(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');

  return feature({
    type: 'MultiPoint',
    coordinates,
  }, properties, options);
}

/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * let multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
export function multiPolygon(coordinates, properties, options) {
  assert(!coordinates, 'coordinates is required');

  return feature({
    type: 'MultiPolygon',
    coordinates,
  }, properties, options);
}

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * let pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * let line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * let collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */
export function geometryCollection(geometries, properties, options) {
  assert(!geometries, 'geometries is required');
  assert(!isArray(geometries), 'geometries must be an Array');

  return feature({
    type: 'GeometryCollection',
    geometries,
  }, properties, options);
}

/**
 * Validate BBox
 *
 * @private
 * @param {Array<number>} bbox BBox to validate
 * @returns {void}
 * @throws Error if BBox is not valid
 * @example
 * validateBBox([-180, -40, 110, 50])
 * //=OK
 * validateBBox([-180, -40])
 * //=Error
 * validateBBox('Foo')
 * //=Error
 * validateBBox(5)
 * //=Error
 * validateBBox(null)
 * //=Error
 * validateBBox(undefined)
 * //=Error
 */
export function validateBBox(bbox) {
  assert(!bbox, 'bbox is required');
  assert(!isArray(bbox), 'bbox must be an Array');
  assert(bbox.length !== 4 && bbox.length !== 6, 'bbox must be an Array of 4 or 6 numbers');
  bbox.forEach((num) => {
    assert(!isNumber(num), 'bbox must only contain numbers');
  });
}

/**
 * Validate Id
 *
 * @private
 * @param {string|number} id Id to validate
 * @returns {void}
 * @throws Error if Id is not valid
 * @example
 * validateId([-180, -40, 110, 50])
 * //=Error
 * validateId([-180, -40])
 * //=Error
 * validateId('Foo')
 * //=OK
 * validateId(5)
 * //=OK
 * validateId(null)
 * //=Error
 * validateId(undefined)
 * //=Error
 */
export function validateId(id) {
  assert(!id, 'id is required');
  assert(['string', 'number'].indexOf(typeof id) === -1, 'id must be a number or a string');
}
