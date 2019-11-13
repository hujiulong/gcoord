import {
  BBox, Feature, FeatureCollection,
  Geometry, GeometryCollection,
  Id, LineString, MultiLineString, MultiPoint,
  MultiPolygon, Point, Polygon, Position,
  Properties,
} from '../../src/geojson';
import {
  isNumber,
} from '../../src/helper';

// https://github.com/Turfjs/turf/blob/master/packages/turf-helpers/index.ts

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
 * var geometry = {
  *   "type": "Point",
  *   "coordinates": [110, 50]
  * };
  *
  * var feature = feature(geometry);
  *
  * //=feature
  */
export function feature<G = Geometry, P = Properties>(
  geom: G,
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): Feature<G, P> {
  const feat: any = { type: "Feature" };
  if (options.id === 0 || options.id) { feat.id = options.id; }
  if (options.bbox) { feat.bbox = options.bbox; }
  feat.properties = properties || {};
  feat.geometry = geom;
  return feat;
}

/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<any>} coordinates Coordinates
 * @param {Object} [options={}] Optional Parameters
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = "Point";
 * var coordinates = [110, 50];
 * var geometry = geometry(type, coordinates);
 * // => geometry
 */
export function geometry(
  type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon",
  coordinates: any,
  options: {} = {},
) {
  switch (type) {
    case "Point": return point(coordinates).geometry;
    case "LineString": return lineString(coordinates).geometry;
    case "Polygon": return polygon(coordinates).geometry;
    case "MultiPoint": return multiPoint(coordinates).geometry;
    case "MultiLineString": return multiLineString(coordinates).geometry;
    case "MultiPolygon": return multiPolygon(coordinates).geometry;
    default: throw new Error(type + " is invalid");
  }
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
 * var point = point([-75.343, 39.984]);
 *
 * //=point
 */
export function point<P = Properties>(
  coordinates: Position,
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): Feature<Point, P> {
  const geom: Point = {
    type: "Point",
    coordinates,
  };
  return feature(geom, properties, options);
}

/**
 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
 *
 * @name points
 * @param {Array<Array<number>>} coordinates an array of Points
 * @param {Object} [properties={}] Translate these properties to each Feature
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Point>} Point Feature
 * @example
 * var points = points([
 *   [-75, 39],
 *   [-80, 45],
 *   [-78, 50]
 * ]);
 *
 * //=points
 */
export function points<P = Properties>(
  coordinates: Position[],
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): FeatureCollection<Point, P> {
  return featureCollection(coordinates.map((coords) => {
    return point(coords, properties);
  }), options);
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
 * var polygon = polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
 *
 * //=polygon
 */
export function polygon<P = Properties>(
  coordinates: Position[][],
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): Feature<Polygon, P> {
  for (const ring of coordinates) {
    if (ring.length < 4) {
      throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
    }
    for (let j = 0; j < ring[ring.length - 1].length; j++) {
      // Check if first point of Polygon contains two numbers
      if (ring[ring.length - 1][j] !== ring[0][j]) {
        throw new Error("First and last Position are not equivalent.");
      }
    }
  }
  const geom: Polygon = {
    type: "Polygon",
    coordinates,
  };
  return feature(geom, properties, options);
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
 * var polygons = polygons([
 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
 * ]);
 *
 * //=polygons
 */
export function polygons<P = Properties>(
  coordinates: Position[][][],
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): FeatureCollection<Polygon, P> {
  return featureCollection(coordinates.map((coords) => {
    return polygon(coords, properties);
  }), options);
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
 * var linestring1 = lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
 * var linestring2 = lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
 *
 * //=linestring1
 * //=linestring2
 */
export function lineString<P = Properties>(
  coordinates: Position[],
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): Feature<LineString, P> {
  if (coordinates.length < 2) { throw new Error("coordinates must be an array of two or more positions"); }
  const geom: LineString = {
    type: "LineString",
    coordinates,
  };
  return feature(geom, properties, options);
}

/**
 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
 *
 * @name lineStrings
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
 * @example
 * var linestrings = lineStrings([
 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
 * ]);
 *
 * //=linestrings
 */
export function lineStrings<P = Properties>(
  coordinates: Position[][],
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): FeatureCollection<LineString, P> {
  return featureCollection(coordinates.map((coords) => {
    return lineString(coords, properties);
  }), options);
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
 * var locationA = point([-75.343, 39.984], {name: 'Location A'});
 * var locationB = point([-75.833, 39.284], {name: 'Location B'});
 * var locationC = point([-75.534, 39.123], {name: 'Location C'});
 *
 * var collection = featureCollection([
 *   locationA,
 *   locationB,
 *   locationC
 * ]);
 *
 * //=collection
 */
export function featureCollection<G = Geometry, P = Properties>(
  features: Array<Feature>,
  options: { bbox?: BBox, id?: Id } = {},
): FeatureCollection<G, P> {
  const fc: any = { type: "FeatureCollection" };
  if (options.id) { fc.id = options.id; }
  if (options.bbox) { fc.bbox = options.bbox; }
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
 * var multiLine = multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
export function multiLineString<P = Properties>(
  coordinates: Position[][],
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): Feature<MultiLineString, P> {
  const geom: MultiLineString = {
    type: "MultiLineString",
    coordinates,
  };
  return feature(geom, properties, options);
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
 * var multiPt = multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
export function multiPoint<P = Properties>(
  coordinates: Position[],
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): Feature<MultiPoint, P> {
  const geom: MultiPoint = {
    type: "MultiPoint",
    coordinates,
  };
  return feature(geom, properties, options);
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
 * var multiPoly = multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
export function multiPolygon<P = Properties>(
  coordinates: Position[][][],
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): Feature<MultiPolygon, P> {
  const geom: MultiPolygon = {
    type: "MultiPolygon",
    coordinates,
  };
  return feature(geom, properties, options);
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
 * var pt = geometry("Point", [100, 0]);
 * var line = geometry("LineString", [[101, 0], [102, 1]]);
 * var collection = geometryCollection([pt, line]);
 *
 * // => collection
 */
export function geometryCollection<P = Properties>(
  geometries: Array<Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon>,
  properties?: P,
  options: { bbox?: BBox, id?: Id } = {},
): Feature<GeometryCollection, P> {
  const geom: GeometryCollection = {
    type: "GeometryCollection",
    geometries,
  };
  return feature(geom, properties, options);
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
export function validateBBox(bbox: any): void {
  if (!bbox) { throw new Error("bbox is required"); }
  if (!Array.isArray(bbox)) { throw new Error("bbox must be an Array"); }
  if (bbox.length !== 4 && bbox.length !== 6) { throw new Error("bbox must be an Array of 4 or 6 numbers"); }
  bbox.forEach((num) => {
    if (!isNumber(num)) { throw new Error("bbox must only contain numbers"); }
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
export function validateId(id: any): void {
  if (!id) { throw new Error("id is required"); }
  if (["string", "number"].indexOf(typeof id) === -1) { throw new Error("id must be a number or a string"); }
}
