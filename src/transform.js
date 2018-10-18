import {
  assert,
  isNumber,
  isArray,
  coordEach,
} from './helper.js';

import * as CRS from './crs/index.js';

/**
 * transform
 *
 * @param {geojson|position} input
 * @returns {geojson|position} output
 */
/* eslint-disable no-param-reassign */
export default function transform(input, fromCRS, toCRS) {
  assert(!input, 'coordinate is required');
  assert(!fromCRS, 'original coordinate system is required');
  assert(!toCRS, 'target coordinate system is required');

  const from = CRS[fromCRS];
  assert(!from, 'original coordinate system is invalid');

  if (fromCRS === toCRS) return input;

  const to = from.to[toCRS];
  assert(!to, 'target coordinate system is invalid');

  const type = typeof (input);
  assert(type !== 'string' && type !== 'object', 'coordinate must be an geojson or an array of position');

  if (type === 'string') input = JSON.parse(input);

  let isPosition = false;
  if (isArray(input)) {
    assert(input.length < 2, 'position must be at 2 numbers long');
    assert(!isNumber(input[0]) || !isNumber(input[1]), 'position must contain numbers');
    isPosition = true;
  }

  let output = null;
  const convert = to;

  if (isPosition) {
    output = convert(input);
  } else {
    coordEach(input, (coord) => {
      const newCoord = convert(coord);
      coord[0] = newCoord[0];
      coord[1] = newCoord[1];
    });

    output = input;
  }

  return output;
}
