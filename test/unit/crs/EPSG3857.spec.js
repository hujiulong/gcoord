import {
  EPSG3857,
} from '../../../src/crs/index.js';

test('EPSG3857 to WGS84', () => {
  const transform = EPSG3857.to.WGS84;

  const result = transform([13692297.367572648, 5621521.486192066]);
  expect(result[0]).toBeCloseTo(123, 5);
  expect(result[1]).toBeCloseTo(45, 5);

  expect(transform([0, 0])).toEqual([0, 0]);
});

test('EPSG3857 to GCJ02', () => {
  const transform = EPSG3857.to.GCJ02;

  const result = transform([13692297.367572648, 5621521.486192066]);
  expect(result[0]).toBeCloseTo(123.00607541, 5);
  expect(result[1]).toBeCloseTo(45.00197815, 5);
});

test('EPSG3857 to BD09', () => {
  const transform = EPSG3857.to.BD09;

  const result = transform([13692297.367572648, 5621521.486192066]);
  expect(result[0]).toBeCloseTo(123.0124491, 5);
  expect(result[1]).toBeCloseTo(45.0083293, 5);
});
