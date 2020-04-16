# Gcoord

[![npm version](https://img.shields.io/npm/v/gcoord.svg)](https://www.npmjs.com/package/gcoord)
[![codecov](https://codecov.io/gh/hujiulong/gcoord/branch/master/graph/badge.svg)](https://codecov.io/gh/hujiulong/gcoord)
[![gzip size](http://img.badgesize.io/https://unpkg.com/gcoord/dist/gcoord.js?compression=gzip)](https://unpkg.com/gcoord/dist/gcoord.js)
[![LICENSE](https://img.shields.io/npm/l/vue.svg)](https://www.npmjs.com/package/gcoord)
[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)

**gcoord**(**g**eographic **coord**inates)是一个处理地理坐标系的JS库，用来修正百度地图、高德地图及其它互联网地图坐标系不统一的问题。

支持转换坐标数组和GeoJSON数据，能在node环境以及所有现代浏览器（IE8+）中运行，gzip后仅3kb。

更多信息可以阅读[地理坐标系](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB)

## Install
通过npm安装:
```bash
npm install gcoord --save
```
或者直接在页面中引入:
```html
<script src="https://unpkg.com/gcoord/dist/gcoord.js"></script>
```
## Import
CommonJS:
```js
const gcoord = require('gcoord');
// 或者
const { transform, WGS84, GCJ02 } = require('gcoord');
```
ES Module:
```js
import gcoord from 'gcoord'
// 或者
import { transform, WGS84, GCJ02 } from 'gcoord'
```
同时也支持AMD和CMD规范


## Usage
例如从手机的GPS得到一个经纬度坐标，需要将其展示在百度地图上，则应该将当前坐标从[WGS-84](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB#wgs-84---%E4%B8%96%E7%95%8C%E5%A4%A7%E5%9C%B0%E6%B5%8B%E9%87%8F%E7%B3%BB%E7%BB%9F)坐标系转换为[BD-09](https://github.com/hujiulong/gcoord/wiki/%E5%9C%B0%E7%90%86%E5%9D%90%E6%A0%87%E7%B3%BB#bd-09---%E7%99%BE%E5%BA%A6%E5%9D%90%E6%A0%87%E7%B3%BB)坐标系
```js
var result = gcoord.transform(
  [116.403988, 39.914266],    // 经纬度坐标
  gcoord.WGS84,               // 当前坐标系
  gcoord.BD09                 // 目标坐标系
);

console.log(result);  // [116.41661560068297, 39.92196580126834]
```
同时gcoord还可以转换GeoJSON对象的坐标系，详细使用方式可以参考[API](#api)

## API

### transform(input, from, to)
进行坐标转换

**参数**
-   `input` **[GeoJSON][GeoJSON] | [string][string] | [Array][Array]&lt;[number][number]>** GeoJSON对象，或GeoJSON字符串，或经纬度数组
-   `from` **[CRS](#crs)** 当前坐标系
-   `to` **[CRS](#crs)** 目标坐标系

**返回值**

**[GeoJSON][GeoJSON] | [Array][Array]&lt;[number][number]>**

**示例**
```js
// 将GCJ02坐标转换为WGS84坐标
var result = gcoord.transform([123, 45], gcoord.GCJ02, gcoord.WGS84);
console.log(result);  // [122.99395597, 44.99804071]
```

```js
// 转换GeoJSON坐标
var geojson = {
  "type": "Point",
  "coordinates": [123, 45]
}
gcoord.transform(geojson, gcoord.GCJ02, gcoord.WGS84);
console.log(geojson.coordinates); // [122.99395597, 44.99804071]
```

返回数组或GeoJSON对象（由输入决定），**注意：当输入为GeoJSON时，transform会改变输入对象**

### CRS
CRS为坐标系，目标支持以下几种坐标系

| CRS                | 坐标格式   | 说明    |
| --------           | --------- | ----- |
| gcoord.WGS84       | [lng,lat] | WGS-84坐标系，GPS设备获取的经纬度坐标   |
| gcoord.GCJ02       | [lng,lat] | GCJ-02坐标系，google中国地图、soso地图、aliyun地图、mapabc地图和高德地图所用的经纬度坐标   |
| gcoord.BD09        | [lng,lat] | BD-09坐标系，百度地图采用的经纬度坐标    |
| gcoord.BD09LL      | [lng,lat] | 同BD09  |
| gcoord.BD09MC      | [x,y]     | BD-09米制坐标，百度地图采用的米制坐标，单位：米  |
| gcoord.BD09Meter   | [x,y]     | 同BD09MC |
| gcoord.Baidu       | [lng,lat] | 百度坐标系，BD-09坐标系别名，同BD-09  |
| gcoord.BMap        | [lng,lat] | 百度地图，BD-09坐标系别名，同BD-09  |
| gcoord.AMap        | [lng,lat] | 高德地图，同GCJ-02  |
| gcoord.WebMercator | [x,y]     | Web Mercator投影，墨卡托投影，同EPSG3857，单位：米 |
| gcoord.WGS1984     | [lng,lat] | WGS-84坐标系别名，同WGS-84  |
| gcoord.EPSG4326    | [lng,lat] | WGS-84坐标系别名，同WGS-84  |
| gcoord.EPSG3857    | [x,y]     | Web Mercator投影，同WebMercator，单位：米  |
| gcoord.EPSG900913  | [x,y]     | Web Mercator投影，同WebMercator，单位：米  |

**支持更多坐标系？**
gcoord的目标是处理web地图中的坐标，目前支持的坐标系已经能满足绝大部分要求了，同时gcoord也能保持轻量。如果需要更专业的坐标系处理工具，可以使用[proj4js](https://github.com/proj4js/proj4js)等开源库


## LICENSE
MIT

[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[Error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

[GeoJSON]: https://tools.ietf.org/html/rfc7946#page-6
