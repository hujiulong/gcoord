import { CRSTypes } from './crs';
import transform from './transform';
import type { GeoJSON, Position } from './geojson';

export type {
  BBox,
  BBox2d,
  BBox3d,
  CollectionTypes,
  Feature,
  FeatureCollection,
  GeoJSON,
  GeoJSONObject,
  Geometries,
  Geometry,
  GeometryCollection,
  GeometryObject,
  GeometryTypes,
  Id,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
  Position,
  Properties,
  Types,
} from './geojson';

export type { CRSTypes };

export type Gcoord = typeof CRSTypes & {
  CRSTypes: typeof CRSTypes;
  transform: <T extends GeoJSON | Position>(
    input: T | string,
    crsFrom: CRSTypes,
    crsTo: CRSTypes,
  ) => T;
};

const exported: Gcoord = {
  ...CRSTypes, // 兼容原来gcoord.WGS84的使用方式
  CRSTypes,
  transform,
};

export default exported;
