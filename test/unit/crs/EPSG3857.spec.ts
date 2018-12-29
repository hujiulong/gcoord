import {
  EPSG3857,
} from '../../../src/crs/index';
import each from '../../fixtures/each';

test('EPSG3857 to WGS84', () => {
  const transform = EPSG3857.to.WGS84;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.EPSG3857);
    expect(result[0]).toBeCloseTo(coords.WGS84[0], 7);
    expect(result[1]).toBeCloseTo(coords.WGS84[1], 7);
  });

  expect(transform([0, 0])).toEqual([0, 0]);
});

test('EPSG3857 to GCJ02', () => {
  const transform = EPSG3857.to.GCJ02;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.EPSG3857);
    expect(result[0]).toBeCloseTo(coords.GCJ02[0], 4);
    expect(result[1]).toBeCloseTo(coords.GCJ02[1], 4);
  });
});

test('EPSG3857 to BD09', () => {
  const transform = EPSG3857.to.BD09;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.EPSG3857);
    expect(result[0]).toBeCloseTo(coords.BD09[0], 4);
    expect(result[1]).toBeCloseTo(coords.BD09[1], 4);
  });
});

test('EPSG3857 to BD09MC', () => {
  const transform = EPSG3857.to.BD09MC;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.EPSG3857);
    expect(Math.abs(result[0] - coords.BD09MC[0])).toBeLessThan(1);
    expect(Math.abs(result[1] - coords.BD09MC[1])).toBeLessThan(1);
  });
});
