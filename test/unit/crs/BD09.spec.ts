import {
  BD09,
} from '../../../src/crs/index';
import each from '../../fixtures/each';

test('BD09 to GCJ02', () => {
  const transform = BD09.to.GCJ02;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.BD09);
    expect(result[0]).toBeCloseTo(coords.GCJ02[0], 5);
    expect(result[1]).toBeCloseTo(coords.GCJ02[1], 5);
  });
});

test('BD09 to WGS84', () => {
  const transform = BD09.to.WGS84;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.BD09);
    expect(result[0]).toBeCloseTo(coords.WGS84[0], 4);
    expect(result[1]).toBeCloseTo(coords.WGS84[1], 4);
  });
});

test('BD09 to EPSG3857', () => {
  const transform = BD09.to.EPSG3857;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.BD09);
    expect(Math.abs(result[0] - coords.EPSG3857[0])).toBeLessThan(1);
    expect(Math.abs(result[1] - coords.EPSG3857[1])).toBeLessThan(1);
  });
});

test('BD09 to BD09MC', () => {
  const transform = BD09.to.BD09MC;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.BD09);
    expect(result[0]).toBeCloseTo(coords.BD09MC[0], 1);
    expect(result[1]).toBeCloseTo(coords.BD09MC[1], 1);
  });

  const result = transform([-123, -45])
  expect(result[0]).toBeCloseTo(-13692446.35077864, 6);
  expect(result[1]).toBeCloseTo(-5591020.962240655, 6);
});
