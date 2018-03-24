import {
    GCJ02
} from '../../../src/crs/index.js'

test( 'GCJ02 to WGS84', () => {

    const transform = GCJ02.to.WGS84;

    const result = transform( [ 123, 45 ] );
    expect( result[ 0 ] ).toBeCloseTo( 122.99395597, 5 );
    expect( result[ 1 ] ).toBeCloseTo( 44.99804071, 5 );

    // not in China
    expect( transform( [ 183, 45 ] ) ).toEqual( [ 183, 45 ] );

} );

test( 'GCJ02 to BD09', () => {

    const transform = GCJ02.to.BD09;

    const result = transform( [ 123, 45 ] );
    expect( result[ 0 ] ).toBeCloseTo( 123.00636499, 5 );
    expect( result[ 1 ] ).toBeCloseTo( 45.00636899, 5 );

} );
