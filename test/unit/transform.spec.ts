import transform from '../../src/transform';
import {
  WGS84,
  GCJ02,
  BD09,
  BD09MC,
  EPSG3857,
} from '../../src/constants';
import {
  point,
} from '../helpers/geojson';
import each from '../fixtures/each';

test('transform - position', () => {

  each('china-cities.json', item => {
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
});

test('transform - geojson', () => {
  let geojson;
  let result;

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


test('transform - input check', () => {

  expect(() => {
    transform('', WGS84, GCJ02)
  }).toThrow();

  expect(() => {
    transform('foo', WGS84, GCJ02)
  }).toThrow();

  expect(() => {
    transform(true, WGS84, GCJ02)
  }).toThrow();

  expect(() => {
    transform([123], WGS84, GCJ02)
  }).toThrow();

  expect(() => {
    transform([123, 'foo'], WGS84, GCJ02)
  }).toThrow();

  const pt = point([123, 45]);

  expect(() => {
    transform(pt, 'Unknown', WGS84)
  }).toThrow();

  expect(() => {
    transform(pt, WGS84, 'Unknown')
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform(pt, WGS84)
  }).toThrow();

  expect(() => {
    // @ts-ignore
    transform(pt)
  }).toThrow();

})
