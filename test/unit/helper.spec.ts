import {
  assert,
  isNumber,
  isObject,
  isString,
  isArray,
  coordEach,
} from '../../src/helper';

import {
  feature,
  point,
  lineString,
  polygon,
  multiPoint,
  multiLineString,
  multiPolygon,
  geometry,
  geometryCollection,
  featureCollection,
} from '../helpers/geojson';

const pt = point([0, 0], {
  a: 1,
});
const line = lineString([
  [0, 0],
  [1, 1],
]);
const poly = polygon([
  [
    [0, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ],
]);
const polyWithHole = polygon([
  [
    [100.0, 0.0],
    [101.0, 0.0],
    [101.0, 1.0],
    [100.0, 1.0],
    [100.0, 0.0],
  ],
  [
    [100.2, 0.2],
    [100.8, 0.2],
    [100.8, 0.8],
    [100.2, 0.8],
    [100.2, 0.2],
  ],
]);
const multiPt = multiPoint([
  [0, 0],
  [1, 1],
]);
const multiLine = multiLineString([
  [
    [0, 0],
    [1, 1],
  ],
  [
    [3, 3],
    [4, 4],
  ],
]);
const multiPoly = multiPolygon([
  [
    [
      [0, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ],
  ],
  [
    [
      [3, 3],
      [2, 2],
      [1, 2],
      [3, 3],
    ],
  ],
]);
const geomCollection = geometryCollection([pt.geometry, line.geometry]);
const geomCollectionDeep = geometryCollection([geomCollection.geometry as any]);
const fcNull = featureCollection([feature(null), feature(null)]);
const fcMixed = featureCollection([
  point([0, 0]),
  lineString([
    [1, 1],
    [2, 2],
  ]),
  multiLineString([
    [
      [1, 1],
      [0, 0],
    ],
    [
      [4, 4],
      [5, 5],
    ],
  ]),
]);

function featureAndCollection(geometry) {
  const feature = {
    type: 'Feature',
    geometry,
    properties: {
      a: 1,
    },
  };

  const featureCollection = {
    type: 'FeatureCollection',
    features: [feature],
  };

  return [geometry, feature, featureCollection];
}

test('assert', () => {
  expect(() => {
    assert(true, 'error msg');
  }).not.toThrow();
  expect(() => {
    assert(false, 'error msg');
  }).toThrow();
});

test('isNumber', () => {
  // true
  expect(isNumber(123)).toBeTruthy();
  expect(isNumber(1.23)).toBeTruthy();
  expect(isNumber(-1.23)).toBeTruthy();
  expect(isNumber(-123)).toBeTruthy();
  expect(isNumber('123')).toBeTruthy();
  expect(isNumber(+'123')).toBeTruthy();
  expect(isNumber('1e10000')).toBeTruthy();
  expect(isNumber(1e10000)).toBeTruthy();
  expect(isNumber(Infinity)).toBeTruthy();
  expect(isNumber(-Infinity)).toBeTruthy();

  // false
  expect(isNumber(+'ciao')).toBeFalsy();
  expect(isNumber('foo')).toBeFalsy();
  expect(isNumber('10px')).toBeFalsy();
  expect(isNumber(NaN)).toBeFalsy();
  expect(isNumber(undefined)).toBeFalsy();
  expect(isNumber(null)).toBeFalsy();
  expect(isNumber({
    a: 1,
  })).toBeFalsy();
  expect(isNumber({})).toBeFalsy();
  expect(isNumber([1, 2, 3])).toBeFalsy();
  expect(isNumber([])).toBeFalsy();
});

test('isObject', () => {
  // true
  expect(isObject({
    a: 1,
  })).toBeTruthy();
  expect(isObject({})).toBeTruthy();

  // false
  expect(isObject(123)).toBeFalsy();
  expect(isObject(Infinity)).toBeFalsy();
  expect(isObject(-123)).toBeFalsy();
  expect(isObject('foo')).toBeFalsy();
  expect(isObject(NaN)).toBeFalsy();
  expect(isObject(undefined)).toBeFalsy();
  expect(isObject(null)).toBeFalsy();
  expect(isObject([1, 2, 3])).toBeFalsy();
  expect(isObject([])).toBeFalsy();
});

test('isString', () => {
  // true
  expect(isString('')).toBeTruthy();
  expect(isString('foo')).toBeTruthy();

  // false
  expect(isString(123)).toBeFalsy();
  expect(isString(Infinity)).toBeFalsy();
  expect(isString(NaN)).toBeFalsy();
  expect(isString(undefined)).toBeFalsy();
  expect(isString(null)).toBeFalsy();
  expect(isString([1, 2, 3])).toBeFalsy();
  expect(isString([])).toBeFalsy();
});

test('isArray', () => {
  // true
  expect(isArray([])).toBeTruthy();
  expect(isArray([1, 2, 3])).toBeTruthy();

  // false
  expect(isArray(123)).toBeFalsy();
  expect(isArray({})).toBeFalsy();
  expect(isArray({
    a: 1,
  })).toBeFalsy();
  expect(isArray(null)).toBeFalsy();
  expect(isArray(NaN)).toBeFalsy();
  expect(isArray(undefined)).toBeFalsy();
});

test('coordEach', () => {
  // @ts-ignore
  expect(() => coordEach({})).toThrow();

  featureAndCollection(pt.geometry).forEach((input) => {
    coordEach(input, (coord, index) => {
      expect(coord).toEqual([0, 0]);
      expect(index).toBe(0);
    });
  });

  featureAndCollection(line.geometry).forEach((input) => {
    const output = [];
    let lastIndex;
    coordEach(input, (coord, index) => {
      output.push(coord);
      lastIndex = index;
    });
    expect(output).toEqual([
      [0, 0],
      [1, 1],
    ]);
    expect(lastIndex).toBe(1);
  });

  featureAndCollection(multiPt.geometry).forEach((input) => {
    const output = [];
    let lastIndex;
    coordEach(input, (coord, index) => {
      output.push(coord);
      lastIndex = index;
    });
    expect(output).toEqual([
      [0, 0],
      [1, 1],
    ]);
    expect(lastIndex).toBe(1);
  });

  featureAndCollection(poly.geometry).forEach((input) => {
    const output = [];
    let lastIndex;
    coordEach(input, (coord, index) => {
      output.push(coord);
      lastIndex = index;
    }, true);
    expect(lastIndex).toBe(2);
  });

  featureAndCollection(poly.geometry).forEach((input) => {
    const output = [];
    let lastIndex;
    coordEach(input, (coord, index) => {
      output.push(coord);
      lastIndex = index;
    });
    expect(output).toEqual([
      [0, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ]);
    expect(lastIndex).toBe(3);
  });

  let coords = [];
  let coordIndexes = [];
  let featureIndexes = [];
  let multiFeatureIndexes = [];
  let geometryIndexes = [];

  coordEach(multiPoly, (coord, coordIndex, featureIndex, multiFeatureIndex) => {
    coords.push(coord);
    coordIndexes.push(coordIndex);
    featureIndexes.push(featureIndex);
    multiFeatureIndexes.push(multiFeatureIndex);
  });
  expect(coordIndexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  expect(featureIndexes).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  expect(multiFeatureIndexes).toEqual([0, 0, 0, 0, 1, 1, 1, 1]);
  expect(coords.length).toBe(8);

  coords = [];
  coordIndexes = [];
  featureIndexes = [];
  multiFeatureIndexes = [];

  coordEach(fcMixed, (coord, coordIndex, featureIndex, multiFeatureIndex) => {
    coords.push(coord);
    coordIndexes.push(coordIndex);
    featureIndexes.push(featureIndex);
    multiFeatureIndexes.push(multiFeatureIndex);
  });
  expect(coordIndexes).toEqual([0, 1, 2, 3, 4, 5, 6]);
  expect(featureIndexes).toEqual([0, 1, 1, 2, 2, 2, 2]);
  expect(multiFeatureIndexes).toEqual([0, 0, 0, 0, 0, 1, 1]);
  expect(coords.length).toBe(7);

  coords = [];
  coordIndexes = [];
  featureIndexes = [];
  multiFeatureIndexes = [];
  geometryIndexes = [];

  coordEach(polyWithHole, (coords, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) => {
    coordIndexes.push(coordIndex);
    featureIndexes.push(featureIndex);
    multiFeatureIndexes.push(multiFeatureIndex);
    geometryIndexes.push(geometryIndex);
  });
  expect(coordIndexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(featureIndexes).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  expect(multiFeatureIndexes).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  expect(geometryIndexes).toEqual([0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);

  coordEach(geomCollectionDeep, (coords, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) => {
    coordIndexes.push(coordIndex);
    featureIndexes.push(featureIndex);
    multiFeatureIndexes.push(multiFeatureIndex);
    geometryIndexes.push(geometryIndex);
  });
  expect(coordIndexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 1]);
  expect(featureIndexes).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  expect(multiFeatureIndexes).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  expect(geometryIndexes).toEqual([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0]);

  let count = 0;
  coordEach(fcNull, () => count++);
  expect(count).toBe(0);

  count = 0;
  coordEach(null, () => count++);
  expect(count).toBe(0);

  count = 0;
  // @ts-ignore
  coordEach({
    type: null,
  }, (coord, index) => {
    count++;
  }, true);
  expect(count).toBe(0);

  count = 0;
  coordEach(pt, () => {
    count++;
    return false;
  });
  expect(count).toBe(1);

  count = 0;
  coordEach(line, () => {
    count++;
    return false;
  });
  expect(count).toBe(1);

  count = 0;
  coordEach(poly, () => {
    count++;
    return false;
  });
  expect(count).toBe(1);

  count = 0;
  coordEach(multiPoly, () => {
    count++;
    return false;
  });
  expect(count).toBe(1);

  count = 0;
  coordEach(geomCollectionDeep, () => {
    count++;
    return false;
  });
  expect(count).toBe(1);
});
