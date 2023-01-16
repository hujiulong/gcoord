import { CRSTypes } from './crs';
import transform from './transform';

export { GeoJSON } from './geojson';

export { CRSTypes };

export { transform };

const exported = {
  ...CRSTypes, // 兼容原来gcoord.WGS84的使用方式
  CRSTypes,
  transform,
};

export default exported;
