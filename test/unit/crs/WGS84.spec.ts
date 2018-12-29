import {
  WGS84,
} from '../../../src/crs/index';
import each from '../../fixtures/each';

test('WGS84 to BD09', () => {
  const transform = WGS84.to.BD09;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.WGS84);
    expect(result[0]).toBeCloseTo(coords.BD09[0], 4);
    expect(result[1]).toBeCloseTo(coords.BD09[1], 4);
  });
});

test('WGS84 to BD09MC', () => {
  const transform = WGS84.to.BD09MC;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.WGS84);
    expect(Math.abs(result[0] - coords.BD09MC[0])).toBeLessThan(1);
    expect(Math.abs(result[1] - coords.BD09MC[1])).toBeLessThan(1);
  });
});

test('WGS84 to GCJ02', () => {
  const transform = WGS84.to.GCJ02;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.WGS84);
    expect(result[0]).toBeCloseTo(coords.GCJ02[0], 4);
    expect(result[1]).toBeCloseTo(coords.GCJ02[1], 4);
  });

  // not in China
  expect(transform([183, 45])).toEqual([183, 45]);
});

test('WGS84 to EPSG3857', () => {
  const transform = WGS84.to.EPSG3857;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.WGS84);
    expect(result[0]).toBeCloseTo(coords.EPSG3857[0], 3);
    expect(result[1]).toBeCloseTo(coords.EPSG3857[1], 3);
  });

  // special value
  let result;

  result = transform([180, 90]);
  expect(result[0]).toBeCloseTo(20037508.342789244, 5);
  expect(result[1]).toBeCloseTo(20037508.342789244, 5);

  result = transform([550, 90]);
  expect(result[0]).toBeCloseTo(20037508.342789244, 5);
  expect(result[1]).toBeCloseTo(20037508.342789244, 5);

  result = transform([-550, 90]);
  expect(result[0]).toBeCloseTo(-20037508.342789244, 5);
  expect(result[1]).toBeCloseTo(20037508.342789244, 5);

  result = transform([0, 0]);
  expect(result[0]).toBeCloseTo(0, 5);
  expect(result[1]).toBeCloseTo(0, 5);

  result = transform([-180, -90]);
  expect(result[0]).toBeCloseTo(-20037508.342789244, 5);
  expect(result[1]).toBeCloseTo(-20037508.342789244, 5);

  result = transform([183, 90]);
  expect(result[0]).toBeCloseTo(-19703549.87040942, 5);
  expect(result[1]).toBeCloseTo(20037508.342789244, 5);
});
