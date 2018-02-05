import { GCJ02toWGS84, WGS84toGCJ02 } from './GCJ02.js'
import { BD09toGCJ02, GCJ02toBD09 } from './BD09.js'
import { compose } from '../helper.js'

const WGS84 = {
    to: {
        GCJ02: WGS84toGCJ02,
        BD09: compose( GCJ02toBD09, WGS84toGCJ02 )
    }
}

const GCJ02 = {
    to: {
        WGS84: GCJ02toWGS84,
        BD09: GCJ02toBD09
    }
}

const BD09 = {
    to: {
        WGS84: compose( GCJ02toWGS84, BD09toGCJ02 ),
        GCJ02: BD09toGCJ02
    }
}

export {
    WGS84,
    GCJ02,
    BD09
}
