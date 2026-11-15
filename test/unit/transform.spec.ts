import transform from '../../src/transform';
import gcoord from '../../src';
import { CRSTypes } from '../../src/crs';
import { GeoJSON, Position } from '../../src/geojson';
import { point } from '../helpers/geojson';
import runWithTimeout from '../helpers/runWithTimeout';
import each from '../fixtures/each';

const { WGS84, GCJ02, BD09, BD09MC, EPSG3857 } = CRSTypes;

test('default export', () => {
  expect(gcoord.WGS84).toBe(WGS84);
  expect(gcoord.transform([123, 45], WGS84, WGS84)).toEqual([123, 45]);
});

test('transform - position', () => {
  each('china-cities.json', (item) => {
    let result: any;
    const { coords } = item;

    result = transform(coords.WGS84.map(String), WGS84, GCJ02);
    expect(result[0]).toBeCloseTo(coords.GCJ02[0], 4);
    expect(result[1]).toBeCloseTo(coords.GCJ02[1], 4);

    result = transform(coords.WGS84, WGS84, GCJ02);
    expect(result[0]).toBeCloseTo(coords.GCJ02[0], 4);
    expect(result[1]).toBeCloseTo(coords.GCJ02[1], 4);

    result = transform(coords.WGS84, WGS84, BD09);
    expect(result[0]).toBeCloseTo(coords.BD09[0], 4);
    expect(result[1]).toBeCloseTo(coords.BD09[1], 4);

    result = transform(coords.WGS84, WGS84, BD09MC);
    expect(Math.abs(result[0] - coords.BD09MC[0])).toBeLessThan(1);
    expect(Math.abs(result[1] - coords.BD09MC[1])).toBeLessThan(1);

    result = transform(coords.WGS84, WGS84, EPSG3857);
    expect(result[0]).toBeCloseTo(coords.EPSG3857[0], 2);
    expect(result[1]).toBeCloseTo(coords.EPSG3857[1], 2);

    result = transform(coords.GCJ02, GCJ02, WGS84);
    expect(result[0]).toBeCloseTo(coords.WGS84[0], 4);
    expect(result[1]).toBeCloseTo(coords.WGS84[1], 4);

    result = transform(coords.GCJ02, GCJ02, BD09);
    expect(result[0]).toBeCloseTo(coords.BD09[0], 5);
    expect(result[1]).toBeCloseTo(coords.BD09[1], 5);

    result = transform(coords.EPSG3857, EPSG3857, GCJ02);
    expect(result[0]).toBeCloseTo(coords.GCJ02[0], 4);
    expect(result[1]).toBeCloseTo(coords.GCJ02[1], 4);

    result = transform(coords.BD09, BD09, GCJ02);
    expect(result[0]).toBeCloseTo(coords.GCJ02[0], 5);
    expect(result[1]).toBeCloseTo(coords.GCJ02[1], 5);

    result = transform(coords.BD09, BD09, BD09MC);
    expect(result[0]).toBeCloseTo(coords.BD09MC[0], 1);
    expect(result[1]).toBeCloseTo(coords.BD09MC[1], 1);
  });

  expect(transform([123, 45], WGS84, WGS84)).toEqual([123, 45]);
  expect(transform([123, 45, 10], WGS84, GCJ02)).toEqual([
    expect.any(Number),
    expect.any(Number),
    10,
  ]);
});

describe('issue #243 regressions', () => {
  // Reference inverses of the continuous offset formula; these edge cases
  // do not guarantee round trips through the bbox-gated forward transform.
  test.each<{ input: Position; expected: Position }>([
    {
      input: [72.0045, 30],
      expected: [72.0006216688898, 30.0031100064641],
    },
    {
      input: [100, 0.83],
      expected: [99.999346383709, 0.8291163901241301],
    },
    {
      input: [72.004, 55],
      expected: [71.99866728489492, 54.99978298970158],
    },
  ])('GCJ02 to WGS84 terminates for $input', ({ input, expected }) => {
    const result = runWithTimeout(() =>
      gcoord.transform(input, gcoord.GCJ02, gcoord.WGS84),
    );

    expect(result).toHaveLength(2);
    expect(Math.abs(result[0] - expected[0])).toBeLessThan(1e-6);
    expect(Math.abs(result[1] - expected[1])).toBeLessThan(1e-6);
  });

  test.each(['position array', 'GeoJSON Point'])(
    'WGS84 to GCJ02 preserves altitude in a %s',
    (inputType) => {
      const position: Position = [116.404, 39.915, 50];
      const result =
        inputType === 'position array'
          ? gcoord.transform(position, gcoord.WGS84, gcoord.GCJ02)
          : gcoord.transform(
              { type: 'Point', coordinates: position },
              gcoord.WGS84,
              gcoord.GCJ02,
            ).coordinates;

      expect(result).toHaveLength(3);
      expect(result[0]).toBeCloseTo(116.41024449916938, 6);
      expect(result[1]).toBeCloseTo(39.91640428150164, 6);
      expect(result[2]).toBe(50);
    },
  );
});

test.each([GCJ02, BD09, BD09MC])(
  'transform - %s to WGS84 and EPSG3857 near the bbox edge',
  (crsFrom) => {
    const input = transform([72.0045, 30], GCJ02, crsFrom);
    const expected: Position = [72.0006216688898, 30.0031100064641];
    const result = runWithTimeout(() => transform(input, crsFrom, WGS84));

    expect(Math.abs(result[0] - expected[0])).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(result[1] - expected[1])).toBeLessThanOrEqual(1e-6);

    const projected = runWithTimeout(() => transform(input, crsFrom, EPSG3857));
    const expectedProjected = transform(expected, WGS84, EPSG3857);

    expect(Math.abs(projected[0] - expectedProjected[0])).toBeLessThan(1);
    expect(Math.abs(projected[1] - expectedProjected[1])).toBeLessThan(1);
  },
);

test('transform - GeoJSON coordinates near the bbox edge', () => {
  const geojson = point([100, 0.83, 50]);
  const result = runWithTimeout(() => transform(geojson, GCJ02, WGS84));

  expect(result.geometry.coordinates[0]).toBeCloseTo(99.999346383709, 6);
  expect(result.geometry.coordinates[1]).toBeCloseTo(0.8291163901241301, 6);
  expect(result.geometry.coordinates[2]).toBe(50);
});

test('transform - geojson', () => {
  let geojson;
  let result;

  geojson = transform(point([123, 45], { a: 1 }), WGS84, GCJ02);
  result = geojson.geometry.coordinates;

  expect(result[0]).toBeCloseTo(123.00607541, 5);
  expect(result[1]).toBeCloseTo(45.00197815, 5);

  const pt = point([123, 45]);
  geojson = transform(JSON.stringify(pt), WGS84, GCJ02) as any;
  result = geojson.geometry.coordinates;

  expect(result[0]).toBeCloseTo(123.00607541, 5);
  expect(result[1]).toBeCloseTo(45.00197815, 5);

  geojson = transform(point([123, 45], { a: 1 }), GCJ02, GCJ02);
  result = geojson.geometry.coordinates;

  expect(result).toEqual([123, 45]);

  geojson = transform(JSON.stringify(pt), WGS84, WGS84) as any;
  expect(geojson.geometry.coordinates).toEqual([123, 45]);
});

test('transform - input check', () => {
  expect(() => {
    transform('', WGS84, GCJ02);
  }).toThrow();

  expect(() => {
    transform('foo', WGS84, GCJ02);
  }).toThrow();

  expect(() => {
    transform('foo', WGS84, WGS84);
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform([Infinity, 45], WGS84, GCJ02);
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform(true, WGS84, GCJ02);
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform([123], WGS84, GCJ02);
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform([123, 'foo'], WGS84, GCJ02);
  }).toThrow();

  const pt = point([123, 45]);

  expect(() => {
    // @ts-ignore
    transform(pt, 'Unknown', WGS84);
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform(pt, WGS84, 'Unknown');
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform(pt, WGS84);
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform(pt);
  }).toThrow();
});
