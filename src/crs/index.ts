import { GCJ02ToWGS84, WGS84ToGCJ02 } from './GCJ02';
import { BD09ToGCJ02, GCJ02ToBD09 } from './BD09';
import { ESPG3857ToWGS84, WGS84ToEPSG3857 } from './EPSG3857';
import { BD09MCtoBD09, BD09toBD09MC } from './BD09MC';
import { compose } from '../helper';

export enum CRSTypes {
  // WGS84
  WGS84 = 'WGS84',
  WGS1984 = WGS84,
  EPSG4326 = WGS84,

  // GCJ02
  GCJ02 = 'GCJ02',
  AMap = GCJ02,

  // BD09
  BD09 = 'BD09',
  BD09LL = BD09,
  Baidu = BD09,
  BMap = BD09,

  // BD09MC
  BD09MC = 'BD09MC',
  BD09Meter = BD09MC,

  // EPSG3857
  EPSG3857 = 'EPSG3857',
  EPSG900913 = EPSG3857,
  EPSG102100 = EPSG3857,
  WebMercator = EPSG3857,
  WM = EPSG3857,
}

export interface CRS {
  to: {
    [key in keyof typeof CRSTypes]?: Function;
  };
}

export const WGS84: CRS = {
  to: {
    [CRSTypes.GCJ02]: WGS84ToGCJ02,
    [CRSTypes.BD09]: compose(GCJ02ToBD09, WGS84ToGCJ02),
    [CRSTypes.BD09MC]: compose(BD09toBD09MC, GCJ02ToBD09, WGS84ToGCJ02),
    [CRSTypes.EPSG3857]: WGS84ToEPSG3857,
  },
};

export const GCJ02: CRS = {
  to: {
    [CRSTypes.WGS84]: GCJ02ToWGS84,
    [CRSTypes.BD09]: GCJ02ToBD09,
    [CRSTypes.BD09MC]: compose(BD09toBD09MC, GCJ02ToBD09),
    [CRSTypes.EPSG3857]: compose(WGS84ToEPSG3857, GCJ02ToWGS84),
  },
};

export const BD09: CRS = {
  to: {
    [CRSTypes.WGS84]: compose(GCJ02ToWGS84, BD09ToGCJ02),
    [CRSTypes.GCJ02]: BD09ToGCJ02,
    [CRSTypes.EPSG3857]: compose(WGS84ToEPSG3857, GCJ02ToWGS84, BD09ToGCJ02),
    [CRSTypes.BD09MC]: BD09toBD09MC,
  },
};

export const EPSG3857: CRS = {
  to: {
    [CRSTypes.WGS84]: ESPG3857ToWGS84,
    [CRSTypes.GCJ02]: compose(WGS84ToGCJ02, ESPG3857ToWGS84),
    [CRSTypes.BD09]: compose(GCJ02ToBD09, WGS84ToGCJ02, ESPG3857ToWGS84),
    [CRSTypes.BD09MC]: compose(
      BD09toBD09MC,
      GCJ02ToBD09,
      WGS84ToGCJ02,
      ESPG3857ToWGS84
    ),
  },
};

export const BD09MC: CRS = {
  to: {
    [CRSTypes.WGS84]: compose(GCJ02ToWGS84, BD09ToGCJ02, BD09MCtoBD09),
    [CRSTypes.GCJ02]: compose(BD09ToGCJ02, BD09MCtoBD09),
    [CRSTypes.EPSG3857]: compose(
      WGS84ToEPSG3857,
      GCJ02ToWGS84,
      BD09ToGCJ02,
      BD09MCtoBD09
    ),
    [CRSTypes.BD09]: BD09MCtoBD09,
  },
};

export const crsMap: Record<CRSTypes, CRS> = {
  WGS84,
  GCJ02,
  BD09,
  EPSG3857,
  BD09MC,
};

export default crsMap;
