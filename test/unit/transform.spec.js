import transform from '../../src/transform.js';
import {
  WGS84,
  WGS1984,
  GCJ02,
  BD09,
  EPSG4326,
} from '../../src/constants.js';

import {
  point,
} from '../helpers/geojson.js';

test('transform - position', () => {
  let result;

  result = transform([123, 45], WGS84, GCJ02);
  expect(result[0]).toBeCloseTo(123.00607541, 5);
  expect(result[1]).toBeCloseTo(45.00197815, 5);

  result = transform([123, 45], WGS84, BD09);
  expect(result[0]).toBeCloseTo(123.0124491, 5);
  expect(result[1]).toBeCloseTo(45.0083293, 5);

  result = transform([123, 45], GCJ02, WGS84);
  expect(result[0]).toBeCloseTo(122.99395597, 5);
  expect(result[1]).toBeCloseTo(44.99804071, 5);

  result = transform([123, 45], GCJ02, BD09);
  expect(result[0]).toBeCloseTo(123.00636499, 5);
  expect(result[1]).toBeCloseTo(45.00636899, 5);

  result = transform([123, 45], BD09, WGS84);
  expect(result[0]).toBeCloseTo(122.98762210, 5);
  expect(result[1]).toBeCloseTo(44.99171540, 5);

  result = transform([123, 45], BD09, GCJ02);
  expect(result[0]).toBeCloseTo(122.99363304, 5);
  expect(result[1]).toBeCloseTo(44.99365430, 5);

  result = transform([123, 45], WGS84, WGS84);
  expect(result).toEqual([123, 45]);
});

test('transform - geojson', () => {
  let geojson; let
    result;

  geojson = transform(point([123, 45], { a: 1 }), WGS84, GCJ02);
  result = geojson.geometry.coordinates;

  expect(result[0]).toBeCloseTo(123.00607541, 5);
  expect(result[1]).toBeCloseTo(45.00197815, 5);

  const pt = point([123, 45]);
  geojson = transform(JSON.stringify(pt), WGS84, GCJ02);
  result = geojson.geometry.coordinates;

  expect(result[0]).toBeCloseTo(123.00607541, 5);
  expect(result[1]).toBeCloseTo(45.00197815, 5);

  geojson = transform(point([123, 45], { a: 1 }), GCJ02, GCJ02);
  result = geojson.geometry.coordinates;

  expect(result).toEqual([123, 45]);
});
