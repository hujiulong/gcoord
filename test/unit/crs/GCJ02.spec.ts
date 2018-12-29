import {
  GCJ02,
} from '../../../src/crs/index';
import each from '../../fixtures/each';

test('GCJ02 to WGS84', () => {
  const transform = GCJ02.to.WGS84;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.GCJ02);
    expect(result[0]).toBeCloseTo(coords.WGS84[0], 4);
    expect(result[1]).toBeCloseTo(coords.WGS84[1], 4);
  });

  // not in China
  expect(transform([183, 45])).toEqual([183, 45]);
});

test('GCJ02 to BD09', () => {
  const transform = GCJ02.to.BD09;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.GCJ02);
    expect(result[0]).toBeCloseTo(coords.BD09[0], 6);
    expect(result[1]).toBeCloseTo(coords.BD09[1], 6);
  });
});

test('GCJ02 to BD09MC', () => {
  const transform = GCJ02.to.BD09MC;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.GCJ02);
    expect(result[0]).toBeCloseTo(coords.BD09MC[0], 1);
    expect(result[1]).toBeCloseTo(coords.BD09MC[1], 1);
  });
});

test('GCJ02 to EPSG3857', () => {
  const transform = GCJ02.to.EPSG3857;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.GCJ02);
    expect(Math.abs(result[0] - coords.EPSG3857[0])).toBeLessThan(1);
    expect(Math.abs(result[1] - coords.EPSG3857[1])).toBeLessThan(1);
  });
});
