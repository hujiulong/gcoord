import {
  BD09MC,
} from '../../../src/crs/index';
import each from '../../fixtures/each';

test('BD09MC to BD09', () => {
  const transform = BD09MC.to.BD09;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.BD09MC);
    expect(result[0]).toBeCloseTo(coords.BD09[0], 5);
    expect(result[1]).toBeCloseTo(coords.BD09[1], 5);
  });
});

test('BD09MC to WGS84', () => {
  const transform = BD09MC.to.WGS84;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.BD09MC);
    expect(result[0]).toBeCloseTo(coords.WGS84[0], 4);
    expect(result[1]).toBeCloseTo(coords.WGS84[1], 4);
  });
});

test('BD09MC to GCJ02', () => {
  const transform = BD09MC.to.GCJ02;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.BD09MC);
    expect(result[0]).toBeCloseTo(coords.GCJ02[0], 5);
    expect(result[1]).toBeCloseTo(coords.GCJ02[1], 5);
  });
});

test('BD09MC to EPSG3857', () => {
  const transform = BD09MC.to.EPSG3857;

  each('china-cities.json', item => {
    const { coords } = item;
    const result = transform(coords.BD09MC);
    expect(Math.abs(result[0] - coords.EPSG3857[0])).toBeLessThan(1);
    expect(Math.abs(result[1] - coords.EPSG3857[1])).toBeLessThan(1);
  });
});
  
  