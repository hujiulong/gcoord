import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const banner = `/* @preserve
 * gcoord ${pkg.version}, ${pkg.description}
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
      banner,
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      banner,
      sourcemap: true,
    },
  ],
  legacy: true, // Needed to create files loadable by IE8
  plugins: [
    babel(),
  ],
};
