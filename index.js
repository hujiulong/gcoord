'use strict';

if (typeof process === 'undefined' || process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/gcoord.cjs.prod.js');
} else {
  module.exports = require('./dist/gcoord.cjs.js');
}
