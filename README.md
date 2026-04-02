# Gcoord

English | [简体中文](./README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/gcoord.svg)](https://www.npmjs.com/package/gcoord)
[![codecov](https://codecov.io/gh/hujiulong/gcoord/branch/master/graph/badge.svg)](https://codecov.io/gh/hujiulong/gcoord)
[![gzip size](http://img.badgesize.io/https://unpkg.com/gcoord/dist/gcoord.global.prod.js?compression=gzip)](https://unpkg.com/gcoord/dist/gcoord.global.prod.js)
[![LICENSE](https://img.shields.io/npm/l/gcoord.svg)](https://www.npmjs.com/package/gcoord)
[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)

**gcoord** (**g**eographic **coord**inates) is a lightweight JavaScript library for transforming coordinates between common web map coordinate reference systems. It helps normalize coordinates from GPS, Baidu Maps, AMap, Google China Maps, and other map providers.

gcoord supports coordinate arrays and GeoJSON objects, has no runtime dependencies, and works in Node.js, modern browsers, and React Native. The browser global build is about 3 KB after gzip.

For background reading, see [Geographic Coordinate Systems](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB).

## Legal Notice

Before publishing, displaying, distributing, or otherwise using map data, make sure you comply with the laws and regulations that apply to your use case.

> Surveying and mapping activities may not use an international coordinate system without approval.
>
> - Surveying and Mapping Law of the People's Republic of China, Article 40 (1)

> Navigation electronic maps must undergo spatial position technical processing before public publication, sale, distribution, display, or use.
>
> - GB 20263-2006, Basic Requirements for Security Processing of Navigation Electronic Maps, 4.1

## Installation

Install from npm:

```bash
npm install gcoord
```

Or load the browser global build with a script tag:

```html
<script src="https://unpkg.com/gcoord@1.0.7/dist/gcoord.global.prod.js"></script>
```

When using a script tag, always pin an exact package version.

## Import

CommonJS:

```js
const gcoord = require('gcoord');
```

ES module:

```js
import gcoord from 'gcoord';
```

Browser global:

```js
window.gcoord.transform([116.403988, 39.914266], gcoord.WGS84, gcoord.BD09);
```

## Usage

If you receive a GPS coordinate from a phone and need to display it on Baidu Maps, convert it from [WGS-84](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB#wgs-84---%E4%B8%96%E7%95%8C%E5%A4%A7%E5%9C%B0%E6%B5%8B%E9%87%8F%E7%B3%BB%E7%BB%9F) to [BD-09](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB#bd-09---%E7%99%BE%E5%BA%A6%E5%9D%90%E6%A0%87%E7%B3%BB):

```js
const result = gcoord.transform(
  [116.403988, 39.914266], // coordinate: [longitude, latitude]
  gcoord.WGS84, // source CRS
  gcoord.BD09, // target CRS
);

console.log(result); // [116.41661560068297, 39.92196580126834]
```

gcoord can also transform GeoJSON objects. See the [API](#api) section for details.

## API

### transform(input, from, to)

Transforms coordinates from one CRS to another.

**Parameters**

- `input` **[GeoJSON][GeoJSON] | [string][string] | [Array][Array]<[number][number]>**: a GeoJSON object, a GeoJSON string, or a coordinate array.
- `from` **[CRS](#crs)**: the source coordinate reference system.
- `to` **[CRS](#crs)**: the target coordinate reference system.

**Returns**

**[GeoJSON][GeoJSON] | [Array][Array]<[number][number]>**

**Examples**

```js
// Convert a GCJ-02 coordinate to WGS-84.
const result = gcoord.transform([123, 45], gcoord.GCJ02, gcoord.WGS84);
console.log(result); // [122.99395597, 44.99804071]
```

```js
// Transform coordinates inside a GeoJSON object.
const geojson = {
  type: 'Point',
  coordinates: [123, 45],
};

gcoord.transform(geojson, gcoord.GCJ02, gcoord.WGS84);
console.log(geojson.coordinates); // [122.99395597, 44.99804071]
```

The return type matches the input type. When the input is a GeoJSON object, `transform` mutates the input object in place.

### CRS

The following coordinate reference systems are supported:

| CRS                  | Coordinate format | Description                                                                  |
| -------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `gcoord.WGS84`       | `[lng, lat]`      | WGS-84, the longitude and latitude coordinates returned by GPS devices.      |
| `gcoord.GCJ02`       | `[lng, lat]`      | GCJ-02, used by AMap, Google China Maps, Soso Maps, Aliyun Maps, and MapABC. |
| `gcoord.BD09`        | `[lng, lat]`      | BD-09, used by Baidu Maps.                                                   |
| `gcoord.BD09LL`      | `[lng, lat]`      | Alias of BD-09.                                                              |
| `gcoord.BD09MC`      | `[x, y]`          | BD-09 meter coordinates, used by Baidu Maps. Unit: meter.                    |
| `gcoord.BD09Meter`   | `[x, y]`          | Alias of BD09MC.                                                             |
| `gcoord.Baidu`       | `[lng, lat]`      | Alias of BD-09.                                                              |
| `gcoord.BMap`        | `[lng, lat]`      | Alias of BD-09.                                                              |
| `gcoord.AMap`        | `[lng, lat]`      | Alias of GCJ-02.                                                             |
| `gcoord.WebMercator` | `[x, y]`          | Web Mercator projection, alias of EPSG3857. Unit: meter.                     |
| `gcoord.WGS1984`     | `[lng, lat]`      | Alias of WGS-84.                                                             |
| `gcoord.EPSG4326`    | `[lng, lat]`      | Alias of WGS-84.                                                             |
| `gcoord.EPSG3857`    | `[x, y]`          | Web Mercator projection. Unit: meter.                                        |
| `gcoord.EPSG900913`  | `[x, y]`          | Alias of Web Mercator.                                                       |

## Development

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

The package is built with `tsup`, tests run with `vitest`, and published files are emitted to `dist/`.

## Need More Coordinate Systems?

gcoord focuses on coordinate systems commonly used by web maps. The supported CRS list covers most web map scenarios while keeping the package small. For more specialized geodesy work, consider using [proj4js](https://github.com/proj4js/proj4js).

## License

MIT

[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[Error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[GeoJSON]: https://tools.ietf.org/html/rfc7946#page-6
