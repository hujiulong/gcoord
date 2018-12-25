import {
    BD09Meter,
  } from '../../../src/crs/index.ts';

  test('BD09Meter to BD09', () => {
      const transform = BD09Meter.to.BD09;

      const result = transform([13692446.35077864, 5591020.962240655]);
      expect(result[0]).toBeCloseTo(122.99999999999993, 5);
      expect(result[1]).toBeCloseTo(44.99999970588358, 5);
  })
  
  