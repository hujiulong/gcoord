import { GCJ02, WGS84 } from '../../../src/crs/index';
import { Position } from '../../../src/geojson';
import each from '../../fixtures/each';
import runWithTimeout from '../../helpers/runWithTimeout';

test('GCJ02 to WGS84', () => {
  const transform = GCJ02.to.WGS84!;

  each('china-cities.json', (item) => {
    const { coords } = item;
    const result = transform(coords.GCJ02);
    expect(result[0]).toBeCloseTo(coords.WGS84[0], 4);
    expect(result[1]).toBeCloseTo(coords.WGS84[1], 4);
  });

  // not in China
  expect(transform([183, 45])).toEqual([183, 45]);
});

// Reference solutions of wgs + delta(wgs) = gcj, including estimates that
// fall outside the bbox. The bbox applies to the input, not each estimate.
test.each<{ gcj: Position; wgs: Position }>([
  {
    gcj: [72.0045, 30],
    wgs: [72.0006216688898, 30.0031100064641],
  },
  {
    gcj: [100, 0.83],
    wgs: [99.999346383709, 0.8291163901241301],
  },
  {
    gcj: [72.004, 55],
    wgs: [71.99866728489492, 54.99978298970158],
  },
  {
    gcj: [72.004, 30],
    wgs: [72.00012281017601, 30.003111521160008],
  },
  {
    gcj: [100, 0.8293],
    wgs: [99.99934639323091, 0.8284162023424962],
  },
  {
    gcj: [137.8347, 30],
    wgs: [137.83023559525324, 30.00231928623418],
  },
  {
    gcj: [100, 55.8271],
    wgs: [99.99753263797692, 55.825876239661945],
  },
  {
    gcj: [72.004, 0.8293],
    wgs: [72.00029811974822, 0.8280480261645499],
  },
  {
    gcj: [72.004, 55.8271],
    wgs: [71.99857219840769, 55.82689391490232],
  },
  {
    gcj: [137.8347, 0.8293],
    wgs: [137.8322202754217, 0.8289952224688071],
  },
  {
    gcj: [137.8347, 55.8271],
    wgs: [137.8256285793644, 55.82456412931724],
  },
])('GCJ02 to WGS84 at bbox boundary $gcj', ({ gcj, wgs }) => {
  const result = runWithTimeout(() => GCJ02.to.WGS84!(gcj));

  expect(Math.abs(result[0] - wgs[0])).toBeLessThanOrEqual(1e-6);
  expect(Math.abs(result[1] - wgs[1])).toBeLessThanOrEqual(1e-6);
});

test('GCJ02 and WGS84 round trips near the west bbox edge', () => {
  // The first inverse estimate crosses the bbox, but the true solution is inside.
  const original: Position = [72.004001, 30];
  const gcj = WGS84.to.GCJ02!(original);

  expect(gcj[0]).toBeCloseTo(72.00788697369691, 6);
  expect(gcj[1]).toBeCloseTo(29.996900346927944, 6);

  const recovered = runWithTimeout(() => GCJ02.to.WGS84!(gcj));
  const roundTrip = WGS84.to.GCJ02!(recovered);

  expect(Math.abs(recovered[0] - original[0])).toBeLessThan(1e-6);
  expect(Math.abs(recovered[1] - original[1])).toBeLessThan(1e-6);
  expect(Math.abs(roundTrip[0] - gcj[0])).toBeLessThan(1e-6);
  expect(Math.abs(roundTrip[1] - gcj[1])).toBeLessThan(1e-6);
});

test.each<Position>([
  [72.003999, 30],
  [137.834701, 30],
  [100, 0.829299],
  [100, 55.827101],
])('GCJ02 to WGS84 just outside the bbox [%s, %s]', (lon, lat) => {
  expect(GCJ02.to.WGS84!([lon, lat])).toEqual([lon, lat]);
});

test('GCJ02 to BD09', () => {
  const transform = GCJ02.to.BD09!;

  each('china-cities.json', (item) => {
    const { coords } = item;
    const result = transform(coords.GCJ02);
    expect(result[0]).toBeCloseTo(coords.BD09[0], 6);
    expect(result[1]).toBeCloseTo(coords.BD09[1], 6);
  });
});

test('GCJ02 to BD09MC', () => {
  const transform = GCJ02.to.BD09MC!;

  each('china-cities.json', (item) => {
    const { coords } = item;
    const result = transform(coords.GCJ02);
    expect(result[0]).toBeCloseTo(coords.BD09MC[0], 1);
    expect(result[1]).toBeCloseTo(coords.BD09MC[1], 1);
  });
});

test('GCJ02 to EPSG3857', () => {
  const transform = GCJ02.to.EPSG3857!;

  each('china-cities.json', (item) => {
    const { coords } = item;
    const result = transform(coords.GCJ02);
    expect(Math.abs(result[0] - coords.EPSG3857[0])).toBeLessThan(1);
    expect(Math.abs(result[1] - coords.EPSG3857[1])).toBeLessThan(1);
  });
});
