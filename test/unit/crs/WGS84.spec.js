import {
    WGS84
} from '../../../src/crs/index.js'

test( 'WGS84 to BD09', () => {

    const transform = WGS84.to.BD09;

    let result = transform( [ 123, 45 ] );
    expect( result[ 0 ] ).toBeCloseTo( 123.0124491, 5 );
    expect( result[ 1 ] ).toBeCloseTo( 45.0083293, 5 );

} );

test( 'WGS84 to GCJ02', () => {

    const transform = WGS84.to.GCJ02;

    let result;

    result = transform( [ 123, 45 ] );
    expect( result[ 0 ] ).toBeCloseTo( 123.00607541, 5 );
    expect( result[ 1 ] ).toBeCloseTo( 45.00197815, 5 );

    // not in China
    expect( transform( [ 183, 45 ] ) ).toEqual( [ 183, 45 ] );

} );
