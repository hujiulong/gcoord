// https://github.com/Turfjs/turf/blob/master/packages/turf-projection/index.ts

const R2D = 180 / Math.PI;
const D2R = Math.PI / 180;
const A = 6378137.0;
const MAXEXTENT = 20037508.342789244;

export function ESPG3857ToWGS84(xy) {
  return [
    (xy[0] * R2D / A),
    ((Math.PI * 0.5) - 2.0 * Math.atan(Math.exp(-xy[1] / A))) * R2D,
  ];
}

export function WGS84ToEPSG3857(lonLat) {
  // compensate longitudes passing the 180th meridian
  // from https://github.com/proj4js/proj4js/blob/master/lib/common/adjust_lon.js
  const adjusted = (Math.abs(lonLat[0]) <= 180) ? lonLat[0] : (lonLat[0] - ((lonLat[0] < 0 ? -1 : 1) * 360));
  const xy = [
    A * adjusted * D2R,
    A * Math.log(Math.tan((Math.PI * 0.25) + (0.5 * lonLat[1] * D2R))),
  ];

  // if xy value is beyond maxextent (e.g. poles), return maxextent
  if (xy[0] > MAXEXTENT) xy[0] = MAXEXTENT;
  if (xy[0] < -MAXEXTENT) xy[0] = -MAXEXTENT;
  if (xy[1] > MAXEXTENT) xy[1] = MAXEXTENT;
  if (xy[1] < -MAXEXTENT) xy[1] = -MAXEXTENT;

  return xy;
}
