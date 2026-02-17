import { CRSTypes } from './crs';
import transform from './transform';
import { parseSrtLocus } from './srt_process';

export type { GeoJSON, Position } from './geojson';

export type { CRSTypes };

const exported = {
  ...CRSTypes, // 兼容原来gcoord.WGS84的使用方式
  CRSTypes,
  transform,
  parseSrtLocus,
};

export default exported;
