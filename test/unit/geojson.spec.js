import {
    feature,
    geometry,
    point,
    points,
    polygon,
    polygons,
    lineString,
    lineStrings,
    featureCollection,
    multiLineString,
    multiPoint,
    multiPolygon,
    geometryCollection,
    validateBBox,
    validateId
} from '../../src/geojson.js'

test( 'test geojson', () => {
    expect( point( [ 1, 2 ] ) ).toEqual( {
        type: "Feature",
        properties: {},
        geometry: {
            type: 'Point',
            coordinates: [ 1, 2 ]
        }
    } );
} );

test( 'test validation', () => {

    expect( function() {
        validateBBox( [ 1, 2 ] );
    } ).toThrow();

    expect( function() {
        validateBBox();
    } ).toThrow();

    expect( function() {
        validateBBox( [ 1, 2, 3, 4 ] );
    } ).not.toThrow();

    expect( function() {
        validateId( [ 1, 2 ] );
    } ).toThrow();

    expect( function() {
        validateId();
    } ).toThrow();

    expect( function() {
        validateId( 'foo' );
    } ).not.toThrow();

    expect( function() {
        validateId( 1 );
    } ).not.toThrow();

} );
