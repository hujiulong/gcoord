import {
    isNumber,
    isObject,
    isArray,
} from '../../src/helper.js'

test( 'isNumber', () => {

    // true
    expect( isNumber( 123 ) ).toBeTruthy();
    expect( isNumber( 1.23 ) ).toBeTruthy();
    expect( isNumber( -1.23 ) ).toBeTruthy();
    expect( isNumber( -123 ) ).toBeTruthy();
    expect( isNumber( '123' ) ).toBeTruthy();
    expect( isNumber( +'123' ) ).toBeTruthy();
    expect( isNumber( '1e10000' ) ).toBeTruthy();
    expect( isNumber( 1e10000 ) ).toBeTruthy();
    expect( isNumber( Infinity ) ).toBeTruthy();
    expect( isNumber( -Infinity ) ).toBeTruthy();

    // false
    expect( isNumber( +'ciao' ) ).toBeFalsy();
    expect( isNumber( 'foo' ) ).toBeFalsy();
    expect( isNumber( '10px' ) ).toBeFalsy();
    expect( isNumber( NaN ) ).toBeFalsy();
    expect( isNumber( undefined ) ).toBeFalsy();
    expect( isNumber( null ) ).toBeFalsy();
    expect( isNumber( { a: 1 } ) ).toBeFalsy();
    expect( isNumber( {} ) ).toBeFalsy();
    expect( isNumber( [ 1, 2, 3 ] ) ).toBeFalsy();
    expect( isNumber( [] ) ).toBeFalsy();
    expect( isNumber( isNumber ) ).toBeFalsy();

} );

test( 'isObject', () => {
    // true
    expect( isObject( { a: 1 } ) ).toBeTruthy();
    expect( isObject( {} ) ).toBeTruthy();

    // false
    expect( isObject( 123 ) ).toBeFalsy();
    expect( isObject( Infinity ) ).toBeFalsy();
    expect( isObject( -123 ) ).toBeFalsy();
    expect( isObject( 'foo' ) ).toBeFalsy();
    expect( isObject( NaN ) ).toBeFalsy();
    expect( isObject( undefined ) ).toBeFalsy();
    expect( isObject( null ) ).toBeFalsy();
    expect( isObject( [ 1, 2, 3 ] ) ).toBeFalsy();
    expect( isObject( [] ) ).toBeFalsy();
    expect( isObject( isNumber ) ).toBeFalsy();

} );

test( 'isArray', () => {
    // true
    expect( isArray( [] ) ).toBeTruthy();
    expect( isArray( [ 1, 2, 3 ] ) ).toBeTruthy();

    // false
    expect( isArray( 123 ) ).toBeFalsy();
    expect( isArray( {} ) ).toBeFalsy();
    expect( isArray( { a: 1 } ) ).toBeFalsy();
    expect( isArray( null ) ).toBeFalsy();
    expect( isArray( NaN ) ).toBeFalsy();
    expect( isArray( undefined ) ).toBeFalsy();

} );
