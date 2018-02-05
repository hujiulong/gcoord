import {
    WGS84,
    GCJ02,
    BD09
} from '../../../src/crs/index.js'

test( 'WGS84 to BD09', () => {

    const transform = BD09.to.WGS84;

    let result = transform( [ 123, 45 ] );
    expect( result[ 0 ] ).toBeCloseTo( 122.98762, 4 );
    expect( result[ 1 ] ).toBeCloseTo( 44.99171, 4 );

} );
