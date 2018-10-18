import {
  WGS84,
} from '../../../src/crs/index.js';

test('WGS84 to BD09', () => {
  const transform = WGS84.to.BD09;

  const result = transform([123, 45]);
  expect(result[0]).toBeCloseTo(123.0124491, 5);
  expect(result[1]).toBeCloseTo(45.0083293, 5);
});

test('WGS84 to GCJ02', () => {
  const transform = WGS84.to.GCJ02;

  let result;

  result = transform([123, 45]);
  expect(result[0]).toBeCloseTo(123.00607541, 5);
  expect(result[1]).toBeCloseTo(45.00197815, 5);

  // not in China
  expect(transform([183, 45])).toEqual([183, 45]);
});

test('WGS84 to EPSG3857', () => {
  const transform = WGS84.to.EPSG3857;

  let result;

  result = transform([123, 45]);
  expect(result[0]).toBeCloseTo(13692297.367572648, 5);
  expect(result[1]).toBeCloseTo(5621521.486192066, 5);

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
