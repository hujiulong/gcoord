import { GCJ02ToWGS84, WGS84ToGCJ02 } from './GCJ02.js'
import { BD09ToGCJ02, GCJ02ToBD09 } from './BD09.js'
import { compose } from '../helper.js'

const WGS84 = {
    to: {
        GCJ02: WGS84ToGCJ02,
        BD09: compose( GCJ02ToBD09, WGS84ToGCJ02 )
    }
}

const GCJ02 = {
    to: {
        WGS84: GCJ02ToWGS84,
        BD09: GCJ02ToBD09
    }
}

const BD09 = {
    to: {
        WGS84: compose( GCJ02ToWGS84, BD09ToGCJ02 ),
        GCJ02: BD09ToGCJ02
    }
}

export {
    WGS84,
    GCJ02,
    BD09
}
