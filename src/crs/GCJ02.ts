import { Position } from '../geojson';

const { sin, cos, sqrt, abs, PI } = Math;

const a = 6378245;
const ee = 0.006693421622965823;

// roughly check whether coordinates are in China.
function isInChinaBbox(lon: number, lat: number): boolean {
  return lon >= 72.004 && lon <= 137.8347 && lat >= 0.8293 && lat <= 55.8271;
}

function transformLat(x: number, y: number): number {
  let ret =
    -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * sqrt(abs(x));
  ret += ((20 * sin(6 * x * PI) + 20 * sin(2 * x * PI)) * 2) / 3;
  ret += ((20 * sin(y * PI) + 40 * sin((y / 3) * PI)) * 2) / 3;
  ret += ((160 * sin((y / 12) * PI) + 320 * sin((y * PI) / 30)) * 2) / 3;
  return ret;
}

function transformLon(x: number, y: number): number {
  let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * sqrt(abs(x));
  ret += ((20 * sin(6 * x * PI) + 20 * sin(2 * x * PI)) * 2) / 3;
  ret += ((20 * sin(x * PI) + 40 * sin((x / 3) * PI)) * 2) / 3;
  ret += ((150 * sin((x / 12) * PI) + 300 * sin((x / 30) * PI)) * 2) / 3;
  return ret;
}

function delta(lon: number, lat: number): number[] {
  let dLon = transformLon(lon - 105, lat - 35);
  let dLat = transformLat(lon - 105, lat - 35);

  const radLat = (lat / 180) * PI;
  let magic = sin(radLat);

  magic = 1 - ee * magic * magic;

  const sqrtMagic = sqrt(magic);
  dLon = (dLon * 180) / ((a / sqrtMagic) * cos(radLat) * PI);
  dLat = (dLat * 180) / (((a * (1 - ee)) / (magic * sqrtMagic)) * PI);

  return [dLon, dLat];
}

export function WGS84ToGCJ02(coord: Position): Position {
  const [lon, lat] = coord;

  if (!isInChinaBbox(lon, lat)) return [lon, lat];

  const d = delta(lon, lat);

  return [lon + d[0], lat + d[1]];
}

export function GCJ02ToWGS84(coord: Position): Position {
  const [lon, lat] = coord;

  if (!isInChinaBbox(lon, lat)) return [lon, lat];

  let [wgsLon, wgsLat] = [lon, lat];

  let tempPoint = WGS84ToGCJ02([wgsLon, wgsLat]);

  let dx = tempPoint[0] - lon;
  let dy = tempPoint[1] - lat;

  while (abs(dx) > 1e-6 || abs(dy) > 1e-6) {
    wgsLon -= dx;
    wgsLat -= dy;

    tempPoint = WGS84ToGCJ02([wgsLon, wgsLat]);
    dx = tempPoint[0] - lon;
    dy = tempPoint[1] - lat;
  }

  return [wgsLon, wgsLat];
}
