import {
    BD09
} from '../../../src/crs/index.js'

test( 'BD09 to GCJ02', () => {

    const transform = BD09.to.GCJ02;

    const result = transform( [ 123, 45 ] );
    expect( result[ 0 ] ).toBeCloseTo( 122.99363304, 5 );
    expect( result[ 1 ] ).toBeCloseTo( 44.99365430, 5 );

} );

test( 'BD09 to WGS84', () => {

    const transform = BD09.to.WGS84;

    const result = transform( [ 123, 45 ] );
    expect( result[ 0 ] ).toBeCloseTo( 122.98762210, 5 );
    expect( result[ 1 ] ).toBeCloseTo( 44.99171540, 5 );

} );
