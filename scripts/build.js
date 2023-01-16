// @ts-check
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const { gzipSync } = require('zlib');

const args = require('minimist')(process.argv.slice(2));
const formats = args.formats || args.f;
const devOnly = args.devOnly || args.d;
const prodOnly = !devOnly && (args.prodOnly || args.p);
const sourceMap = args.sourcemap || args.s;
const isRelease = args.release;
const buildTypes = args.t || args.types || isRelease;

const dir = path.resolve(__dirname, '../');
const pkg = require('../package.json');
const env = devOnly ? 'development' : 'production';

run();

async function run() {
  if (isRelease) {
    // remove build cache for release builds to avoid outdated enum values
    await fs.remove(path.resolve(__dirname, '../node_modules/.rts2_cache'));
  }

  await build();
  checkSize();
}

async function build() {
  // if building a specific format, do not remove dist.
  if (!formats) {
    await fs.remove(`${dir}/dist`);
  }

  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `NODE_ENV:${env}`,
        formats ? `FORMATS:${formats}` : ``,
        buildTypes ? `TYPES:true` : ``,
        prodOnly ? `PROD_ONLY:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``,
      ]
        .filter(Boolean)
        .join(','),
    ],
    { stdio: 'inherit' }
  );

  if (buildTypes) {
    console.log();
    console.log(
      chalk.bold(chalk.yellow(`Rolling up type definitions for gcoord...`))
    );

    // build types
    const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

    const extractorConfigPath = path.resolve(dir, `api-extractor.json`);
    const extractorConfig =
      ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
    const extractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true,
    });

    if (extractorResult.succeeded) {
      // concat additional d.ts to rolled-up dts
      const typesDir = path.resolve(dir, 'types');
      if (await fs.exists(typesDir)) {
        const dtsPath = path.resolve(dir, pkg.types);
        const existing = await fs.readFile(dtsPath, 'utf-8');
        const typeFiles = await fs.readdir(typesDir);
        const toAdd = await Promise.all(
          typeFiles.map((file) => {
            return fs.readFile(path.resolve(typesDir, file), 'utf-8');
          })
        );
        await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'));
      }
      console.log(
        chalk.bold(chalk.green(`API Extractor completed successfully.`))
      );
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`
      );
      process.exitCode = 1;
    }

    await fs.remove(`${dir}/dist/types`);
  }
}

function checkSize() {
  checkFileSize(`${dir}/dist/gcoord.global.prod.js`);
}

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const file = fs.readFileSync(filePath);
  const minSize = (file.length / 1024).toFixed(2) + 'kb';
  const gzipped = gzipSync(file);
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
  console.log();
  console.log(
    `${chalk.gray(
      chalk.bold(path.basename(filePath))
    )} min:${minSize} / gzip:${gzippedSize}`
  );
}
