# Gcoord

[English](./README.md) | 简体中文

[![npm version](https://img.shields.io/npm/v/gcoord.svg)](https://www.npmjs.com/package/gcoord)
[![codecov](https://codecov.io/gh/hujiulong/gcoord/branch/master/graph/badge.svg)](https://codecov.io/gh/hujiulong/gcoord)
[![gzip size](http://img.badgesize.io/https://unpkg.com/gcoord/dist/gcoord.global.prod.js?compression=gzip)](https://unpkg.com/gcoord/dist/gcoord.global.prod.js)
[![LICENSE](https://img.shields.io/npm/l/gcoord.svg)](https://www.npmjs.com/package/gcoord)
[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)

**gcoord**（**g**eographic **coord**inates）是一个轻量的 JavaScript 地理坐标转换库，用于在常见 Web 地图坐标系之间转换坐标。它可以帮助你统一来自 GPS、百度地图、高德地图、Google 中国地图以及其他地图服务商的坐标。

gcoord 支持转换坐标数组和 GeoJSON 对象，没有运行时依赖，可在 Node.js、现代浏览器和 React Native 中使用。浏览器全局构建 gzip 后约 3 KB。

更多背景信息可以阅读[地理坐标系](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB)。

## 法律提示

在发布、展示、传播或以其他方式使用地图数据前，请务必遵守适用于你使用场景的法律法规。

> （禁止）未经批准，在测绘活动中擅自采用国际坐标系统。
>
> - 《中华人民共和国测绘法》第 40 条第 1 款

> 导航电子地图在公开出版、销售、传播、展示和使用前，必须进行空间位置技术处理。
>
> - GB 20263-2006《导航电子地图安全处理技术基本要求》4.1

## 安装

通过 npm 安装：

```bash
npm install gcoord
```

或者直接在页面中通过 script 标签引入浏览器全局构建：

```html
<script src="https://unpkg.com/gcoord@1.0.7/dist/gcoord.global.prod.js"></script>
```

通过 script 标签引入时，请始终指定精确的包版本号。

## 引入

CommonJS：

```js
const gcoord = require('gcoord');
```

ES Module：

```js
import gcoord from 'gcoord';
```

浏览器全局变量：

```js
window.gcoord.transform([116.403988, 39.914266], gcoord.WGS84, gcoord.BD09);
```

## 使用

例如，从手机 GPS 得到一个经纬度坐标后，如果需要将它展示在百度地图上，应当将坐标从 [WGS-84](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB#wgs-84---%E4%B8%96%E7%95%8C%E5%A4%A7%E5%9C%B0%E6%B5%8B%E9%87%8F%E7%B3%BB%E7%BB%9F) 转换为 [BD-09](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB#bd-09---%E7%99%BE%E5%BA%A6%E5%9D%90%E6%A0%87%E7%B3%BB)：

```js
const result = gcoord.transform(
  [116.403988, 39.914266], // 坐标：[经度，纬度]
  gcoord.WGS84, // 源坐标系
  gcoord.BD09, // 目标坐标系
);

console.log(result); // [116.41661560068297, 39.92196580126834]
```

gcoord 也可以转换 GeoJSON 对象中的坐标。详细用法见 [API](#api)。

## API

### transform(input, from, to)

将坐标从一个 CRS 转换到另一个 CRS。

**参数**

- `input` **[GeoJSON][GeoJSON] | [string][string] | [Array][Array]<[number][number]>**：GeoJSON 对象、GeoJSON 字符串或坐标数组。
- `from` **[CRS](#crs)**：源坐标系。
- `to` **[CRS](#crs)**：目标坐标系。

**返回值**

**[GeoJSON][GeoJSON] | [Array][Array]<[number][number]>**

**示例**

```js
// 将 GCJ-02 坐标转换为 WGS-84 坐标。
const result = gcoord.transform([123, 45], gcoord.GCJ02, gcoord.WGS84);
console.log(result); // [122.99395597, 44.99804071]
```

```js
// 转换 GeoJSON 对象中的坐标。
const geojson = {
  type: 'Point',
  coordinates: [123, 45],
};

gcoord.transform(geojson, gcoord.GCJ02, gcoord.WGS84);
console.log(geojson.coordinates); // [122.99395597, 44.99804071]
```

返回值类型与输入类型一致。**注意：当输入为 GeoJSON 对象时，`transform` 会原地修改输入对象。**

### CRS

支持以下坐标系：

| CRS                  | 坐标格式     | 说明                                                                                |
| -------------------- | ------------ | ----------------------------------------------------------------------------------- |
| `gcoord.WGS84`       | `[lng, lat]` | WGS-84，GPS 设备获取的经纬度坐标。                                                  |
| `gcoord.GCJ02`       | `[lng, lat]` | GCJ-02，高德地图、Google 中国地图、搜搜地图、阿里云地图和 MapABC 使用的经纬度坐标。 |
| `gcoord.BD09`        | `[lng, lat]` | BD-09，百度地图采用的经纬度坐标。                                                   |
| `gcoord.BD09LL`      | `[lng, lat]` | BD-09 的别名。                                                                      |
| `gcoord.BD09MC`      | `[x, y]`     | BD-09 米制坐标，百度地图采用的米制坐标，单位：米。                                  |
| `gcoord.BD09Meter`   | `[x, y]`     | BD09MC 的别名。                                                                     |
| `gcoord.Baidu`       | `[lng, lat]` | BD-09 的别名。                                                                      |
| `gcoord.BMap`        | `[lng, lat]` | BD-09 的别名。                                                                      |
| `gcoord.AMap`        | `[lng, lat]` | GCJ-02 的别名。                                                                     |
| `gcoord.WebMercator` | `[x, y]`     | Web Mercator 投影，EPSG3857 的别名，单位：米。                                      |
| `gcoord.WGS1984`     | `[lng, lat]` | WGS-84 的别名。                                                                     |
| `gcoord.EPSG4326`    | `[lng, lat]` | WGS-84 的别名。                                                                     |
| `gcoord.EPSG3857`    | `[x, y]`     | Web Mercator 投影，单位：米。                                                       |
| `gcoord.EPSG900913`  | `[x, y]`     | Web Mercator 的别名。                                                               |

## 开发

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

项目使用 `tsup` 构建，使用 `vitest` 测试，发布产物会输出到 `dist/`。

## 支持更多坐标系？

gcoord 的目标是处理 Web 地图中的常见坐标系。目前支持的坐标系已经能满足大多数 Web 地图场景，同时可以保持包体积足够轻量。如果需要更专业的坐标系处理工具，可以使用 [proj4js](https://github.com/proj4js/proj4js) 等开源库。

## 许可证

MIT

[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[Error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[GeoJSON]: https://tools.ietf.org/html/rfc7946#page-6
