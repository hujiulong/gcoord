import { GCJ02ToWGS84, WGS84ToGCJ02 } from './GCJ02';
import { BD09ToGCJ02, GCJ02ToBD09 } from './BD09';
import { ESPG3857ToWGS84, WGS84ToEPSG3857 } from './EPSG3857';
import { BD09MCtoBD09, BD09toBD09MC } from './BD09MC';
import { compose } from '../helper';

export interface CRS {
  to: {
    [key: string]: Function
  }
}

const WGS84: CRS = {
  to: {
    GCJ02: WGS84ToGCJ02,
    BD09: compose(GCJ02ToBD09, WGS84ToGCJ02),
    BD09MC: compose(BD09toBD09MC, GCJ02ToBD09, WGS84ToGCJ02),
    EPSG3857: WGS84ToEPSG3857,
  },
};

const GCJ02: CRS = {
  to: {
    WGS84: GCJ02ToWGS84,
    BD09: GCJ02ToBD09,
    BD09MC: compose(BD09toBD09MC, GCJ02ToBD09),
    EPSG3857: compose(WGS84ToEPSG3857, GCJ02ToWGS84),
  },
};

const BD09: CRS = {
  to: {
    WGS84: compose(GCJ02ToWGS84, BD09ToGCJ02),
    GCJ02: BD09ToGCJ02,
    EPSG3857: compose(WGS84ToEPSG3857, GCJ02ToWGS84, BD09ToGCJ02),
    BD09MC: BD09toBD09MC,
  },
};

const EPSG3857: CRS = {
  to: {
    WGS84: ESPG3857ToWGS84,
    GCJ02: compose(WGS84ToGCJ02, ESPG3857ToWGS84),
    BD09: compose(GCJ02ToBD09, WGS84ToGCJ02, ESPG3857ToWGS84),
    BD09MC: compose(BD09toBD09MC, GCJ02ToBD09, WGS84ToGCJ02, ESPG3857ToWGS84),
  },
};

const BD09MC: CRS = {
  to: {
    WGS84: compose(GCJ02ToWGS84, BD09ToGCJ02, BD09MCtoBD09),
    GCJ02: compose(BD09ToGCJ02, BD09MCtoBD09),
    EPSG3857: compose(WGS84ToEPSG3857, GCJ02ToWGS84, BD09ToGCJ02, BD09MCtoBD09),
    BD09: BD09MCtoBD09,
  },
};

export {
  WGS84,
  GCJ02,
  BD09,
  EPSG3857,
  BD09MC,
};
