import BD09 from './BD09.js'
import GCJ02 from './GCJ02.js'

export default {
    from: {
        GCJ02: GCJ02.to.WGS84,
        BD09: BD09.to.WGS84,
    },
    to: {
        GCJ02: GCJ02.from.WGS84,
        BD09: BD09.from.WGS84,
    }
}
