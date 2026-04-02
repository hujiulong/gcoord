import { assert, isNumber, isArray, coordEach } from './helper';
import { Position, GeoJSON } from './geojson';
import crsMap, { CRSTransform, CRSTypes } from './crs';

/**
 * transform
 *
 * @param input - GeoJSON object, GeoJSON string, or coordinate position.
 * @param crsFrom - Original coordinate reference system.
 * @param crsTo - Target coordinate reference system.
 * @returns Transformed GeoJSON object or coordinate position.
 */
/* eslint-disable no-param-reassign */
export default function transform<T extends GeoJSON | Position>(
  input: T | string,
  crsFrom: CRSTypes,
  crsTo: CRSTypes,
): T {
  assert(!!input, 'The args[0] input coordinate is required');
  assert(!!crsFrom, 'The args[1] original coordinate system is required');
  assert(!!crsTo, 'The args[2] target coordinate system is required');

  const from = crsMap[crsFrom];
  assert(!!from, `Invalid original coordinate system: ${crsFrom}`);

  const to: CRSTransform | undefined =
    crsFrom === crsTo ? undefined : from.to[crsTo]!;
  assert(
    crsFrom === crsTo || !!to,
    `Invalid target coordinate system: ${crsTo}`,
  );

  const type = typeof input;
  assert(
    type === 'string' || type === 'object',
    `Invalid input coordinate type: ${type}`,
  );

  if (type === 'string') {
    try {
      input = JSON.parse(<string>input);
    } catch {
      throw new Error(`Invalid input coordinate: ${input}`);
    }
  }

  let isPosition = false;
  if (isArray(input)) {
    assert(input.length >= 2, `Invalid input coordinate: ${input}`);
    assert(
      isNumber(input[0]) && isNumber(input[1]),
      `Invalid input coordinate: ${input}`,
    );
    input = input.map(Number) as any;
    isPosition = true;
  }

  if (crsFrom === crsTo) return input as T;

  const convert = to!;

  if (isPosition) {
    const position = <number[]>input;
    const converted = convert(<Position>position);
    return [...converted, ...position.slice(2)] as T;
  }

  // GeoJSON类型直接转换输入
  coordEach(<GeoJSON>input, (coord) => {
    [coord[0], coord[1]] = convert(coord);
  });

  return input as T;
}
