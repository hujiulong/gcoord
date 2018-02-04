import GCJ02 from './GCJ02.js'
import { compose } from '../helper.js'

const { sin, cos, atan2, sqrt, abs, PI } = Math;

const baiduFactor = PI * 3000.0 / 180.0;

function toGCJ02( coord ) {

    const [ lon, lat ] = coord;

    const x = lon - 0.0065;
    const y = lat - 0.006;
    const z = sqrt( x * x + y * y ) - 0.00002 * sin( y * baiduFactor );
    const theta = atan2( y, x ) - 0.000003 * cos( x * baiduFactor );
    const newX = z * cos( theta );
    const newY = z * sin( theta );

    return [ newLon, newLat ];
}

function fromGCJ02( coord ) {

    const [ lon, lat ] = coord;

    const x = lon;
    const y = lat;
    const z = sqrt( x * x + y * y ) + 0.00002 * sin( y * baiduFactor );
    const theta = atan2( y, x ) + 0.000003 * cos( x * baiduFactor );

    const newLon = z * cos( theta ) + 0.0065;
    const newLat = z * sin( theta ) + 0.006;

    return [ newLon, newLat ];

}

export default {
    from: {
        WGS84: compose( fromGCJ02, GCJ02.from.WGS84 ),
        GCJ02: fromGCJ02,
    },
    to: {
        WGS84: compose( GCJ02.to.WGS84, toGCJ02 ),
        GCJ02: toGCJ02,
    }
}
