import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

const banner = `/* @preserve
 * gcoord ${pkg.version}, ${pkg.description}
 * Copyright (c) ${new Date().getFullYear()} Jiulong Hu <me@hujiulong.com>
 */
`;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: pkg.name,
      banner,
      sourcemap: true,
      exports: 'default',
      plugins: [terser()],
    },
    {
      file: pkg.module,
      format: 'es',
      banner,
      exports: 'default',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      cacheRoot: './.tmp/.rpt2_cache',
      useTsconfigDeclarationDir: true,
    }),
  ],
};
