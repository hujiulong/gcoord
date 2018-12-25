import {
  BD09,
} from '../../../src/crs/index.ts';

test('BD09 to GCJ02', () => {
  const transform = BD09.to.GCJ02;

  const result = transform([123, 45]);
  expect(result[0]).toBeCloseTo(122.99363304, 5);
  expect(result[1]).toBeCloseTo(44.99365430, 5);
});

test('BD09 to WGS84', () => {
  const transform = BD09.to.WGS84;

  const result = transform([123, 45]);
  expect(result[0]).toBeCloseTo(122.98762210, 5);
  expect(result[1]).toBeCloseTo(44.99171540, 5);
});

test('BD09 to EPSG3857', () => {
  const transform = BD09.to.EPSG3857;

  const result = transform([123, 45]);
  expect(result[0]).toBeCloseTo(13690919.46621167, 5);
  expect(result[1]).toBeCloseTo(5620217.339885741, 5);
});

test('BD09 to BD09Meter', () => {
  const transform = BD09.to.BD09Meter;

  const result = transform([123, 45]);
  expect(result[0]).toBeCloseTo(13692446.35077864, 5);
  expect(result[1]).toBeCloseTo(5591020.962240655, 5);
});


test('Bd09 to BD09Meter 2', () => {
  const transform = BD09.to.BD09Meter;

  const result = transform([-123, -45]);
  expect(result[0]).toBeCloseTo(-13692446.35077864, 5);
  expect(result[1]).toBeCloseTo(-5591020.962240655, 5);
})
