import pkg from './package.json'
import babel from 'rollup-plugin-babel';

const banner = `/* @preserve
 * gcoord ${pkg.version}, a JS library for transform geographical coordinates.
 * Copyright (c) 2018 Jiulong Hu <me@hujiulong.com>
 */
`;

export default {
    input: 'src/index.js',
    output: [
        {
            file: pkg.main,
            format: 'umd',
            name: pkg.name,
            banner: banner,
            exports: 'named',
            sourcemap: true
        },
        {
            file: pkg.module,
            format: 'es',
            banner: banner,
            exports: 'named',
            sourcemap: true
        }
    ],
    legacy: true, // Needed to create files loadable by IE8
    plugins: [
        babel()
    ]
};
