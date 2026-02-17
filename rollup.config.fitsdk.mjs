import terser from '@rollup/plugin-terser';

export default [
  // Development build
  {
    input: 'fit-javascript-sdk/src/index.js',
    output: {
      file: 'dist/fitsdk.global.js',
      format: 'iife',
      name: 'FitSDK',
      exports: 'named',
    },
  },
  // Production (minified) build
  {
    input: 'fit-javascript-sdk/src/index.js',
    output: {
      file: 'dist/fitsdk.global.prod.js',
      format: 'iife',
      name: 'FitSDK',
      exports: 'named',
    },
    plugins: [
      terser({
        compress: {
          ecma: 2015,
          pure_getters: true,
        },
      }),
    ],
  },
];
