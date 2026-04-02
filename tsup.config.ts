import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { defineConfig, type Options } from 'tsup';

const banner = `/**
 * @preserve
 * gcoord ${process.env.npm_package_version}, geographic coordinate library
 * Copyright (c) ${new Date().getFullYear()} Jiulong Hu <me@hujiulong.com>
 */`;

const baseConfig = {
  entry: ['src/index.ts'],
  bundle: true,
  clean: false,
  sourcemap: false,
  splitting: false,
  target: 'es2016',
  treeshake: true,
  banner: {
    js: banner,
  },
} satisfies Options;

function printGzipSize(fileName: string) {
  const filePath = resolve('dist', fileName);
  if (!existsSync(filePath)) return;

  const file = readFileSync(filePath);
  const minSize = `${(file.length / 1024).toFixed(2)}kb`;
  const gzipSize = `${(gzipSync(file).length / 1024).toFixed(2)}kb`;
  console.log(`${basename(filePath)} min:${minSize} / gzip:${gzipSize}`);
}

export default defineConfig([
  {
    ...baseConfig,
    clean: true,
    dts: true,
    format: ['esm', 'cjs'],
    outDir: 'dist',
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs',
      };
    },
  },
  {
    ...baseConfig,
    entry: {
      'gcoord.global': 'src/index.ts',
    },
    format: ['iife'],
    globalName: 'gcoord',
    platform: 'browser',
    outExtension() {
      return {
        js: '.js',
      };
    },
  },
  {
    ...baseConfig,
    entry: {
      'gcoord.global.prod': 'src/index.ts',
    },
    format: ['iife'],
    globalName: 'gcoord',
    minify: true,
    platform: 'browser',
    outExtension() {
      return {
        js: '.js',
      };
    },
    async onSuccess() {
      printGzipSize('gcoord.global.prod.js');
    },
  },
]);
