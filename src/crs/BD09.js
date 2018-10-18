const {
  sin, cos, atan2, sqrt, PI,
} = Math;

const baiduFactor = PI * 3000.0 / 180.0;

export function BD09ToGCJ02(coord) {
  const [lon, lat] = coord;

  const x = lon - 0.0065;
  const y = lat - 0.006;
  const z = sqrt(x * x + y * y) - 0.00002 * sin(y * baiduFactor);
  const theta = atan2(y, x) - 0.000003 * cos(x * baiduFactor);
  const newLon = z * cos(theta);
  const newLat = z * sin(theta);

  return [newLon, newLat];
}

export function GCJ02ToBD09(coord) {
  const [lon, lat] = coord;

  const x = lon;
  const y = lat;
  const z = sqrt(x * x + y * y) + 0.00002 * sin(y * baiduFactor);
  const theta = atan2(y, x) + 0.000003 * cos(x * baiduFactor);

  const newLon = z * cos(theta) + 0.0065;
  const newLat = z * sin(theta) + 0.006;

  return [newLon, newLat];
}
