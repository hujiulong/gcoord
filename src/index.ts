import { CRSTypes } from './crs';

import transform from './transform';

const exported = {
  ...CRSTypes, // 兼容原来gcoord.WGS84的使用方式
  CRSTypes,
  transform,
};

export default exported;
