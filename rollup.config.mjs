// @ts-check
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import ts from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import chalk from 'chalk'
import terser from '@rollup/plugin-terser'

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const resolve = p => path.resolve(__dirname, p)
const pkg = require(resolve(`package.json`))

// ensure TS checks only once for each build
let hasTSChecked = false

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/gcoord.esm-bundler.js`),
    format: `es`
  },
  'esm-browser': {
    file: resolve(`dist/gcoord.esm-browser.js`),
    format: `es`
  },
  cjs: {
    file: resolve(`dist/gcoord.cjs.js`),
    format: `cjs`
  },
  global: {
    file: resolve(`dist/gcoord.global.js`),
    format: `iife`
  },
}

const defaultFormats = Object.keys(outputConfigs)
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const formats = inlineFormats || defaultFormats
const configs = process.env.PROD_ONLY
  ? []
  : formats.map(format => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
  formats.forEach(format => {
    if (format === 'cjs') {
      configs.push(createProductionConfig(format))
    }
    if (/^(global|esm-browser)/.test(format)) {
      configs.push(createMinifiedConfig(format))
    }
  })
}

export default configs

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(chalk.yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  const isGlobalBuild = /global/.test(format)

  output.exports = 'named';
  output.sourcemap = !!process.env.SOURCE_MAP
  output.banner = `/**
 * @preserve
 * gcoord ${pkg.version}, ${pkg.description}
 * Copyright (c) ${new Date().getFullYear()} Jiulong Hu <me@hujiulong.com>
 */`;

  if (isGlobalBuild) {
    output.name = 'gcoord';
  }

  const shouldEmitDeclarations =
    pkg.types && process.env.TYPES != null && !hasTSChecked

  const tsPlugin = ts({
    check: process.env.NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      compilerOptions: {
        target: isGlobalBuild ? 'es3' : 'es2015',
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations,
        declarationDir: shouldEmitDeclarations ? 'dist/types' : undefined,
      },
      exclude: ['test', 'test-dts']
    }
  })
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  return {
    input: resolve('src/index.ts'),
    plugins: [
      json({
        namedExports: false
      }),
      tsPlugin,
      ...plugins
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    treeshake: {
      moduleSideEffects: false
    }
  }
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/gcoord.${format}.prod.js`),
    format: outputConfigs[format].format
  })
}

function createMinifiedConfig(format) {
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true
        },
        safari10: true
      })
    ]
  )
}