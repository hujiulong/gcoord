import {
  assert,
  isNumber,
  isArray,
  coordEach,
} from './helper';
import { Position, GeoJSON } from './geojson';
import * as CRS from './crs';

type AllCRS = Record<string, CRS.CRS>;

/**
 * transform
 *
 * @param {geojson|position|string} input
 * @returns {geojson|position} output
 */
/* eslint-disable no-param-reassign */
export default function transform(input: any, crsFrom: string, crsTo: string): GeoJSON | Position | string {
  assert(!!input, 'Coordinate is required');
  assert(!!crsFrom, 'Original coordinate system is required');
  assert(!!crsTo, 'Target coordinate system is required');

  const from = (<AllCRS>CRS)[crsFrom];
  assert(!!from, 'Original coordinate system is invalid');

  if (crsFrom === crsTo) return input;

  const to: Function = from.to[crsTo];
  assert(!!to, 'Target coordinate system is invalid');

  const type = typeof (input);
  assert(type === 'string' || type === 'object', 'Coordinate must be an geojson or an array of position');

  if (type === 'string') {
    try {
      input = JSON.parse(<string>input);
    } catch (e) {
      throw new Error('Input is a invalid JSON string');
    }
  }

  let isPosition = false;
  if (isArray(input)) {
    assert(input.length >= 2, 'The length of position must be greater than or equal to 2');
    assert(isNumber(input[0]) && isNumber(input[1]), 'Position array members should be all numbers');
    input = input.map(Number);
    isPosition = true;
  }

  let output = null;
  const convert = to;

  if (isPosition) {
    output = convert(<Position>input);
  } else {
    coordEach(<GeoJSON>input, (coord: number[]) => {
      [coord[0], coord[1]] = convert(coord);
    });

    output = input;
  }

  return output;
}
