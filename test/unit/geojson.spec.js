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

// import * as gcoord from '../../dist/gcoord.esm.js'

test( 'point', () => {
    const ptArray = point( [ 5, 10 ], {
        name: 'test point'
    } );


    expect( ptArray.geometry.coordinates[ 0 ] ).toBe( 5 );
    expect( ptArray.geometry.coordinates[ 1 ] ).toBe( 10 );
    expect( ptArray.properties.name ).toBe( 'test point' );

    expect( () => {
        point( 'hey', 'invalid' );
    } ).toThrow();

    const noProps = point( [ 0, 0 ] );
    expect( noProps.properties ).toEqual( {} );


} );

test( 'polygon', () => {
    const poly = polygon( [
        [
            [ 5, 10 ],
            [ 20, 40 ],
            [ 40, 0 ],
            [ 5, 10 ]
        ]
    ], {
        name: 'test polygon'
    } );

    expect( poly.geometry.coordinates[ 0 ][ 0 ][ 0 ] ).toBe( 5 );
    expect( poly.geometry.coordinates[ 0 ][ 1 ][ 0 ] ).toBe( 20 );
    expect( poly.geometry.coordinates[ 0 ][ 2 ][ 0 ] ).toBe( 40 );
    expect( poly.properties.name ).toBe( 'test polygon' );
    expect( poly.geometry.type ).toBe( 'Polygon' );
    expect( () => {
        polygon( [
            [
                [ 20.0, 0.0 ],
                [ 101.0, 0.0 ],
                [ 101.0, 1.0 ],
                [ 100.0, 1.0 ],
                [ 100.0, 0.0 ]
            ]
        ] );
    } ).toThrow( /First and last Position are not equivalent/ );

    expect( () => {
        polygon( [
            [
                [ 20.0, 0.0 ],
                [ 101.0, 0.0 ]
            ]
        ] );
    } ).toThrow( /Each LinearRing of a Polygon must have 4 or more Positions/ );

    const noProperties = polygon( [
        [
            [ 5, 10 ],
            [ 20, 40 ],
            [ 40, 0 ],
            [ 5, 10 ]
        ]
    ] );
    expect( noProperties.properties ).toEqual( {} );

    expect( noProperties.properties ).toEqual( {} );

} );

test( 'lineString', () => {
    const line = lineString( [
        [ 5, 10 ],
        [ 20, 40 ]
    ], {
        name: 'test line'
    } );

    expect( line.geometry.coordinates[ 0 ][ 0 ] ).toBe( 5 );
    expect( line.geometry.coordinates[ 1 ][ 0 ] ).toBe( 20 );
    expect( line.properties.name ).toBe( 'test line' );

    expect( lineString( [
        [ 5, 10 ],
        [ 20, 40 ]
    ] ).properties ).toEqual( {} );

    expect( () => lineString() ).toThrow();
    expect( () => lineString( [
        [ 5, 10 ]
    ] ) ).toThrow();

} );

test( 'featureCollection', () => {
    const p1 = point( [ 0, 0 ], {
        name: 'first point'
    } );
    const p2 = point( [ 0, 10 ] );
    const p3 = point( [ 10, 10 ] );
    const p4 = point( [ 10, 0 ] );
    const fc = featureCollection( [ p1, p2, p3, p4 ] );

    expect( fc.features.length ).toBe( 4 );
    expect( fc.features[ 0 ].properties.name ).toBe( 'first point' );
    expect( fc.type ).toBe( 'FeatureCollection' );
    expect( fc.features[ 1 ].geometry.type ).toBe( 'Point' );
    expect( fc.features[ 1 ].geometry.coordinates[ 0 ] ).toBe( 0 );
    expect( fc.features[ 1 ].geometry.coordinates[ 1 ] ).toBe( 10 );
    expect( () => featureCollection( fc ) ).toThrow( /features must be an Array/ );
    expect( () => featureCollection( p1 ) ).toThrow( /features must be an Array/ );

} );

test( 'multilinestring', () => {

    expect( multiLineString( [
        [
            [ 0, 0 ],
            [ 10, 10 ]
        ],
        [
            [ 5, 0 ],
            [ 15, 8 ]
        ]
    ] ) ).toEqual( {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'MultiLineString',
            coordinates: [
                [
                    [ 0, 0 ],
                    [ 10, 10 ]
                ],
                [
                    [ 5, 0 ],
                    [ 15, 8 ]
                ]
            ]
        }
    } );


    expect( multiLineString( [
        [
            [ 0, 0 ],
            [ 10, 10 ]
        ],
        [
            [ 5, 0 ],
            [ 15, 8 ]
        ]
    ], {
        test: 23
    } ) ).toEqual( {
        type: 'Feature',
        properties: {
            test: 23
        },
        geometry: {
            type: 'MultiLineString',
            coordinates: [
                [
                    [ 0, 0 ],
                    [ 10, 10 ]
                ],
                [
                    [ 5, 0 ],
                    [ 15, 8 ]
                ]
            ]
        }
    } );


    expect( () => {
        multiLineString();
    } ).toThrow();


} );


test( 'multiPoint', () => {

    expect( multiPoint( [
        [ 0, 0 ],
        [ 10, 10 ]
    ] ) ).toEqual( {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'MultiPoint',
            coordinates: [
                [ 0, 0 ],
                [ 10, 10 ]
            ]
        }
    } );


    expect( multiPoint( [
        [ 0, 0 ],
        [ 10, 10 ]
    ], {
        test: 23
    } ) ).toEqual( {
        type: 'Feature',
        properties: {
            test: 23
        },
        geometry: {
            type: 'MultiPoint',
            coordinates: [
                [ 0, 0 ],
                [ 10, 10 ]
            ]
        }
    } );


    expect( () => {
        multiPoint();
    } ).toThrow();


} );

test( 'feature', () => {
    const pt = {
        type: 'Point',
        coordinates: [
            67.5,
            32.84267363195431
        ]
    };
    const line = {
        type: 'LineString',
        coordinates: [
            [
                82.96875,
                58.99531118795094
            ],
            [
                72.7734375,
                55.57834467218206
            ],
            [
                84.0234375,
                55.57834467218206
            ]
        ]
    };
    const polygon = {
        type: 'Polygon',
        coordinates: [
            [
                [
                    85.78125, -3.513421045640032
                ],
                [
                    85.78125,
                    13.581920900545844
                ],
                [
                    92.46093749999999,
                    13.581920900545844
                ],
                [
                    92.46093749999999, -3.513421045640032
                ],
                [
                    85.78125, -3.513421045640032
                ]
            ]
        ]
    };

    expect( feature( pt ).type ).toBe( 'Feature' );
    expect( feature( line ).type ).toBe( 'Feature' );
    expect( feature( polygon ).type ).toBe( 'Feature' );

    expect( feature( pt ) ).toEqual( {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Point',
            coordinates: [
                67.5,
                32.84267363195431
            ]
        }
    } );

} );

test( 'multipolygon', () => {

    expect( multiPolygon( [
        [
            [
                [ 94, 57 ],
                [ 78, 49 ],
                [ 94, 43 ],
                [ 94, 57 ]
            ]
        ],
        [
            [
                [ 93, 19 ],
                [ 63, 7 ],
                [ 79, 0 ],
                [ 93, 19 ]
            ]
        ]
    ] ) ).toEqual( {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'MultiPolygon',
            coordinates: [
                [
                    [
                        [ 94, 57 ],
                        [ 78, 49 ],
                        [ 94, 43 ],
                        [ 94, 57 ]
                    ]
                ],
                [
                    [
                        [ 93, 19 ],
                        [ 63, 7 ],
                        [ 79, 0 ],
                        [ 93, 19 ]
                    ]
                ]
            ]
        }
    } );


    expect( multiPolygon( [
        [
            [
                [ 94, 57 ],
                [ 78, 49 ],
                [ 94, 43 ],
                [ 94, 57 ]
            ]
        ],
        [
            [
                [ 93, 19 ],
                [ 63, 7 ],
                [ 79, 0 ],
                [ 93, 19 ]
            ]
        ]
    ], {
        test: 23
    } ) ).toEqual( {
        type: 'Feature',
        properties: {
            test: 23
        },
        geometry: {
            type: 'MultiPolygon',
            coordinates: [
                [
                    [
                        [ 94, 57 ],
                        [ 78, 49 ],
                        [ 94, 43 ],
                        [ 94, 57 ]
                    ]
                ],
                [
                    [
                        [ 93, 19 ],
                        [ 63, 7 ],
                        [ 79, 0 ],
                        [ 93, 19 ]
                    ]
                ]
            ]
        }
    } );


    expect( () => {
        multiPolygon();
    } ).toThrow();


} );

test( 'geometry', () => {

    expect( geometry( 'Point', [ 100, 0 ] ) ).toEqual( {
        type: 'Point',
        coordinates: [ 100, 0 ]
    } );

    expect( geometry( 'LineString', [
        [ 101, 0 ],
        [ 102, 1 ]
    ] ) ).toEqual( {
        type: 'LineString',
        coordinates: [
            [ 101, 0 ],
            [ 102, 1 ]
        ]
    } );

    expect( geometry( 'Polygon', [
        [
            [ 5, 10 ],
            [ 20, 40 ],
            [ 40, 0 ],
            [ 5, 10 ]
        ]
    ] ) ).toEqual( {
        type: 'Polygon',
        coordinates: [
            [
                [ 5, 10 ],
                [ 20, 40 ],
                [ 40, 0 ],
                [ 5, 10 ]
            ]
        ]
    } );

    expect( geometry( 'MultiPoint', [
        [ 0, 0 ],
        [ 10, 10 ]
    ] ) ).toEqual( {
        type: 'MultiPoint',
        coordinates: [
            [ 0, 0 ],
            [ 10, 10 ]
        ]
    } );

    expect( geometry( 'MultiLineString', [
        [
            [ 0, 0 ],
            [ 10, 10 ]
        ],
        [
            [ 5, 0 ],
            [ 15, 8 ]
        ]
    ] ) ).toEqual( {
        type: 'MultiLineString',
        coordinates: [
            [
                [ 0, 0 ],
                [ 10, 10 ]
            ],
            [
                [ 5, 0 ],
                [ 15, 8 ]
            ]
        ]
    } );

    expect( geometry( 'MultiPolygon', [
        [
            [
                [ 94, 57 ],
                [ 78, 49 ],
                [ 94, 43 ],
                [ 94, 57 ]
            ]
        ],
        [
            [
                [ 93, 19 ],
                [ 63, 7 ],
                [ 79, 0 ],
                [ 93, 19 ]
            ]
        ]
    ] ) ).toEqual( {
        type: 'MultiPolygon',
        coordinates: [
            [
                [
                    [ 94, 57 ],
                    [ 78, 49 ],
                    [ 94, 43 ],
                    [ 94, 57 ]
                ]
            ],
            [
                [
                    [ 93, 19 ],
                    [ 63, 7 ],
                    [ 79, 0 ],
                    [ 93, 19 ]
                ]
            ]
        ]
    } );

    expect( () => geometry( 'a', [ 100, 0 ] ) ).toThrow();

    expect( geometry( 'Point', [ 100, 0 ], { bbox: [ 10, 20, 30, 40 ] } ) ).toEqual( {
        type: 'Point',
        coordinates: [ 100, 0 ],
         bbox: [ 10, 20, 30, 40 ]
    } );

} );

test( 'geometrycollection', () => {
    const pt = {
        type: 'Point',
        coordinates: [ 100, 0 ]
    };
    const line = {
        type: 'LineString',
        coordinates: [
            [ 101, 0 ],
            [ 102, 1 ]
        ]
    };
    const gc = geometryCollection( [ pt, line ] );


    expect( gc ).toEqual( {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'GeometryCollection',
            geometries: [ {
                    type: 'Point',
                    coordinates: [ 100, 0 ]
                },
                {
                    type: 'LineString',
                    coordinates: [
                        [ 101, 0 ],
                        [ 102, 1 ]
                    ]
                }
            ]
        }
    } );

    const gcWithProps = geometryCollection( [ pt, line ], {
        a: 23
    } );

    expect( gcWithProps ).toEqual( {
        type: 'Feature',
        properties: {
            a: 23
        },
        geometry: {
            type: 'GeometryCollection',
            geometries: [ {
                    type: 'Point',
                    coordinates: [ 100, 0 ]
                },
                {
                    type: 'LineString',
                    coordinates: [
                        [ 101, 0 ],
                        [ 102, 1 ]
                    ]
                }
            ]
        }
    } );


} );

test( 'null geometries', () => {
    expect( feature( null ).geometry ).toBeNull();
    expect( featureCollection( [ feature( null ) ] ).features[ 0 ].geometry ).toBeNull();
    expect( geometryCollection( [ feature( null ).geometry ] ).geometry.geometries[ 0 ] ).toBeNull();
    expect( geometryCollection( [] ).geometry.geometries.length ).toBe( 0 );

} );

test( 'Handle Id & BBox properties', () => {
    const id = 12345;
    const bbox = [ 10, 30, 10, 30 ];
    const pt = point( [ 10, 30 ], {}, {
        bbox,
        id
    } );
    const ptId0 = point( [ 10, 30 ], {}, {
        bbox,
        id: 0
    } );
    const fc = featureCollection( [ pt ], {
        bbox,
        id
    } );
    expect( pt.id ).toBe( id );
    expect( ptId0.id ).toBe( 0 );
    expect( pt.bbox ).toBe( bbox );
    expect( fc.id ).toBe( id );
    expect( fc.bbox ).toBe( bbox );

    expect( () => point( [ 10, 30 ], {}, {
        bbox: [ 0 ],
        id
    } ) ).toThrow();

    expect( () => point( [ 10, 30 ], {}, {
        bbox,
        id: {
            invalid: 'id'
        }
    } ) ).toThrow();

    expect( () => featureCollection( [ pt ], {
        bbox: [ 0 ],
        id
    } ) ).toThrow();

    expect( () => featureCollection( [ pt ], {
        bbox: [ 0 ],
        id: {
            invalid: 'id'
        }
    } ) ).toThrow();
} );

test( 'points', () => {
    const pts = points( [
        [ -75, 39 ],
        [ -80, 45 ],
        [ -78, 50 ]
    ], {
        foo: 'bar'
    }, {
        id: 'hello'
    } );

    expect( pts.features.length ).toBe( 3 );
    expect( pts.id ).toBe( 'hello' );
    expect( pts.features[ 0 ].properties.foo ).toBe( 'bar' );

} );

test( 'lineStrings', () => {
    let lines = lineStrings( [
        [
            [ -24, 63 ],
            [ -23, 60 ],
            [ -25, 65 ],
            [ -20, 69 ]
        ],
        [
            [ -14, 43 ],
            [ -13, 40 ],
            [ -15, 45 ],
            [ -10, 49 ]
        ]
    ], {
        foo: 'bar'
    }, {
        id: 'hello'
    } );

    expect( lines.features.length ).toBe( 2 );
    expect( lines.id ).toBe( 'hello' );
    expect( lines.features[ 0 ].properties.foo ).toBe( 'bar' );

} );

test( 'polygons', () => {
    let pgs = polygons( [
        [
            [
                [ -5, 52 ],
                [ -4, 56 ],
                [ -2, 51 ],
                [ -7, 54 ],
                [ -5, 52 ]
            ]
        ],
        [
            [
                [ -15, 42 ],
                [ -14, 46 ],
                [ -12, 41 ],
                [ -17, 44 ],
                [ -15, 42 ]
            ]
        ],
    ], {
        foo: 'bar'
    }, {
        id: 'hello'
    } );

    expect( pgs.features.length ).toBe( 2 );
    expect( pgs.id ).toBe( 'hello' );
    expect( pgs.features[ 0 ].properties.foo ).toBe( 'bar' );

} );
