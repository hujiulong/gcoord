import { GCJ02ToWGS84, WGS84ToGCJ02 } from './GCJ02.js';
import { BD09ToGCJ02, GCJ02ToBD09 } from './BD09.js';
import { ESPG3857ToWGS84, WGS84ToEPSG3857 } from './EPSG3857.js';
import { compose } from '../helper.js';

const WGS84 = {
  to: {
    GCJ02: WGS84ToGCJ02,
    BD09: compose(GCJ02ToBD09, WGS84ToGCJ02),
    EPSG3857: WGS84ToEPSG3857,
  },
};

const GCJ02 = {
  to: {
    WGS84: GCJ02ToWGS84,
    BD09: GCJ02ToBD09,
    EPSG3857: compose(WGS84ToEPSG3857, GCJ02ToWGS84),
  },
};

const BD09 = {
  to: {
    WGS84: compose(GCJ02ToWGS84, BD09ToGCJ02),
    GCJ02: BD09ToGCJ02,
    EPSG3857: compose(WGS84ToEPSG3857, GCJ02ToWGS84, BD09ToGCJ02),
  },
};

const EPSG3857 = {
  to: {
    WGS84: ESPG3857ToWGS84,
    GCJ02: compose(WGS84ToGCJ02, ESPG3857ToWGS84),
    BD09: compose(GCJ02ToBD09, WGS84ToGCJ02, ESPG3857ToWGS84),
  },
};

export {
  WGS84,
  GCJ02,
  BD09,
  EPSG3857,
};
