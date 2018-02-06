# gcoord

[![npm version](https://img.shields.io/npm/v/gcoord.svg)](https://www.npmjs.com/package/gcoord)
[![Build Status](https://travis-ci.org/hujiulong/gcoord.svg?branch=master)](https://travis-ci.org/hujiulong/gcoord)
[![codecov](https://codecov.io/gh/hujiulong/gcoord/branch/master/graph/badge.svg)](https://codecov.io/gh/hujiulong/gcoord)
[![gzip size](http://img.badgesize.io/https://unpkg.com/gcoord/dist/gcoord.js?compression=gzip)](https://unpkg.com/gcoord/dist/gcoord.js)
[![LICENSE](https://img.shields.io/npm/l/vue.svg)](https://www.npmjs.com/package/gcoord)

gcoord( **g**eographic **coord**inates)是一个处理地理坐标的js库

它能够处理GeoJSON，能够在不同坐标系之间做转换

* 轻量，零依赖，gzip后大小仅3kb
* 兼容性强，能在node环境以及所有现代浏览器（IE8+）中运行
* 稳定高效，100%测试覆盖
* 支持转换GeoJSON

## 关于坐标系
我们通常用经纬度来表示一个地理位置，但是由于一些原因，我们从不同渠道得到的经纬度信息可能并不是在同一个坐标系下。

* 高德地图、腾讯地图以及谷歌中国区地图使用的是**GCJ-02**坐标系
* 百度地图使用的是**BD-09**坐标系
* 底层接口(HTML5 Geolocation或ios、安卓API)通过GPS设备获取的坐标使用的是**WGS-84**坐标系

不同的坐标系之间可能有几十到几百米的偏移，所以在开发基于地图的产品，或者做地理数据可视化时，我们需要修正不同坐标系之间的偏差。



### WGS-84 - 世界大地测量系统
WGS-84（World Geodetic System, WGS）是使用最广泛的坐标系，也是世界通用的坐标系，GPS设备得到的经纬度就是在WGS84坐标系下的经纬度。通常通过底层接口得到的定位信息都是WGS84坐标系。

### GCJ-02 - 国测局坐标
GCJ-02（G-Guojia国家，C-Cehui测绘，J-Ju局），又被称为火星坐标系，是一种基于WGS-84制定的大地测量系统，由中国国测局制定。此坐标系所采用的混淆算法会在经纬度中加入随机的偏移。

国家规定，**中国大陆所有公开地理数据都需要至少用GCJ-02进行加密**，也就是说我们从国内公司的产品中得到的数据，一定是经过了加密的。绝大部分国内互联网地图提供商都是使用GCJ-02坐标系，包括高德地图，谷歌地图中国区等。

> 导航电子地图在公开出版、销售、传播、展示和使用前，必须进行空间位置技术处理。<br> — GB 20263―2006《导航电子地图安全处理技术基本要求》，4.1

### BD-09 - 百度坐标系
BD-09（Baidu, BD）是百度地图使用的地理坐标系，其在GCJ-02上多增加了一次变换，用来保护用户隐私。从百度产品中得到的坐标都是BD-09坐标系。

### 相互转换
GCJ-02和BD-09都是用来对地理数据进行加密的，所以也不会公开逆向转换的方法。理论上，GCJ-02的加密过程是不可逆的，但是可以通过一些方法来逼近接原始坐标，并且这种方式的精度很高。gcoord使用的纠偏方式达到了厘米级的精度，能满足绝大多数情况。

## 安装
通过npm安装
```bash
npm install gcoord --save
```
或者直接下载[gcoord.js](https://unpkg.com/gcoord/dist/gcoord.js)

## 使用
### transform
进行坐标转换
**Parameters**

-   `input` **{geojson|string|array}** geoJSON对象，或geoJSON字符串，或经纬度数组
-   `fromCRS` **{CRS}** 当前坐标系
-   `toCRS` **{CRS}** 目标坐标系

**Examples**
```js
// 将GCJ02坐标转换为WGS84坐标
var result = gcoord.transform( [ 123, 45 ], gcoord.GCJ02, gcoord.WGS84 );
```

## LICENSE
MIT
