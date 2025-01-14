## [1.0.7](https://github.com/hujiulong/gcoord/compare/v1.0.6...v1.0.7) (2025-01-14)


### Bug Fixes

* BD09MCtoBD09 error when latitude < 0 ([#236](https://github.com/hujiulong/gcoord/issues/236)) ([fc6bb6d](https://github.com/hujiulong/gcoord/commit/fc6bb6d105e9427d2deff6ad3d633e547cceb1cd))
* fix typo ([#237](https://github.com/hujiulong/gcoord/issues/237)) ([af03233](https://github.com/hujiulong/gcoord/commit/af032334791b82c65eebc3d21be6e15ee983eca6))
* rename ESPG3857 to EPSG3857 ([#238](https://github.com/hujiulong/gcoord/issues/238)) ([0639cf8](https://github.com/hujiulong/gcoord/commit/0639cf81ecefdb2eabb3142e56be3c6bdf71edb2))



## [1.0.6](https://github.com/hujiulong/gcoord/compare/v1.0.5...v1.0.6) (2024-03-12)


### Bug Fixes

* support for mini-program (closes [#232](https://github.com/hujiulong/gcoord/issues/232)) ([b62a3b9](https://github.com/hujiulong/gcoord/commit/b62a3b96ddd897ca067ed51f7fd117c0268dded3))



## [1.0.5](https://github.com/hujiulong/gcoord/compare/v1.0.4...v1.0.5) (2023-02-02)



## [1.0.4](https://github.com/hujiulong/gcoord/compare/v1.0.3...v1.0.4) (2023-02-02)



## [1.0.3](https://github.com/hujiulong/gcoord/compare/v1.0.2...v1.0.3) (2023-02-02)



## [1.0.2](https://github.com/hujiulong/gcoord/compare/v1.0.1...v1.0.2) (2023-02-02)



## [1.0.1](https://github.com/hujiulong/gcoord/compare/v0.3.2...v1.0.1) (2023-01-17)


### Bug Fixes

* fix export of global and cjs formats ([c9be685](https://github.com/hujiulong/gcoord/commit/c9be685b61730b3e3b6d53ba54582b6a463699e4))


### Features

* provide building products in more formats ([549931c](https://github.com/hujiulong/gcoord/commit/549931c50e701ab17e4a44bb667b9f0dc6f2da27))
* type-friendly export mode ([dc48766](https://github.com/hujiulong/gcoord/commit/dc4876628603ec099066962473fa769f66bb035b))



# [1.0.0](https://github.com/hujiulong/gcoord/compare/v0.3.2...v1.0.0) (2023-01-16)


### Features

* provide building products in more formats ([da8d857](https://github.com/hujiulong/gcoord/commit/da8d857b9af372fe5edb9436a46c7f9be12e78da))
* type-friendly export mode ([dc48766](https://github.com/hujiulong/gcoord/commit/dc4876628603ec099066962473fa769f66bb035b))



## [0.3.1](https://github.com/hujiulong/gcoord/compare/v0.3.0...v0.3.1) (2021-02-23)


### Bug Fixes

* use default export only ([ae0d806](https://github.com/hujiulong/gcoord/commit/ae0d80602934589f57f53e97dd0c6b9b187e53e7))



# [0.3.0](https://github.com/hujiulong/gcoord/compare/v0.3.0-beta.2...v0.3.0) (2021-02-18)



## [0.2.3](https://github.com/hujiulong/gcoord/compare/v0.2.2...v0.2.3) (2019-04-15)


### Bug Fixes

* geojson.d.ts -> geojson.ts ([132e52a](https://github.com/hujiulong/gcoord/commit/132e52adbe9cbbce1e76feae0b4ccacee3e1cc66))



## [0.2.2](https://github.com/hujiulong/gcoord/compare/v0.2.1...v0.2.2) (2019-04-08)



## [0.2.1](https://github.com/hujiulong/gcoord/compare/v0.2.0...v0.2.1) (2019-04-07)


### Bug Fixes

* compatible string array(closes [#13](https://github.com/hujiulong/gcoord/issues/13)) ([d9501d2](https://github.com/hujiulong/gcoord/commit/d9501d292412b06c2e2128d1bba0a99c85cdbec7))



# [0.2.0](https://github.com/hujiulong/gcoord/compare/1c066864ddf5e4e23d67d041e333f60b61955b67...v0.2.0) (2018-12-29)


### Bug Fixes

* fix a bug throwing an exception when transforming the EPSG3857([#3](https://github.com/hujiulong/gcoord/issues/3)) ([cd8db56](https://github.com/hujiulong/gcoord/commit/cd8db562ff8b94691540632330a549aa6521cc29))
* fix assert ([742c937](https://github.com/hujiulong/gcoord/commit/742c937e3dbd2d4c3c98f2c7d85fe06cb40178d5))
* fix circular dependency ([51e5ca3](https://github.com/hujiulong/gcoord/commit/51e5ca3b296ea9fc913d12f9485458cf08895113))
* fix circular dependency ([4ab8127](https://github.com/hujiulong/gcoord/commit/4ab8127d14e8c7ebe8bf153ca431e4add1295b68))
* fix CRS module import ([05c88b3](https://github.com/hujiulong/gcoord/commit/05c88b3a2cfe0d8827fd9e09956335920c88e637))
* fix the wrong variable name ([8a9e9b0](https://github.com/hujiulong/gcoord/commit/8a9e9b05a9ded06ca711f98f0eab64710b19942f))
* original CRS is allowed to be equal to target CRS ([15b8776](https://github.com/hujiulong/gcoord/commit/15b8776ead7c9152900f2271a006dd46d5cd548f))


### Features

* add CRS aliases & format code ([c1c99ea](https://github.com/hujiulong/gcoord/commit/c1c99ea4bb87f7b6ef5bdc7f47b2649e4110dd2f))
* add EPSG900913 ([e702c37](https://github.com/hujiulong/gcoord/commit/e702c3781847eda82b3043b7e6e3045d670730b7))
* add support for conversion between BD09 and BD09Meter ([#10](https://github.com/hujiulong/gcoord/issues/10)) ([6b837ec](https://github.com/hujiulong/gcoord/commit/6b837eca19bd06ca9c3e699be119c549f8aabdb3))
* mixing named and default exports ([abfdb2e](https://github.com/hujiulong/gcoord/commit/abfdb2e6b5bdd5c2ba295a467c63410ca0895e5f))
* mixing named and default exports ([be244cf](https://github.com/hujiulong/gcoord/commit/be244cf6f51abad9968c312a1e570728174855b8))
* remove geojson([#1](https://github.com/hujiulong/gcoord/issues/1)) ([a9d08ab](https://github.com/hujiulong/gcoord/commit/a9d08ab69f5d157c61a5fb9031b4fd2a9bed0e8b))
* support the mutual conversion of WGS84, GCJ02 and BD09. ([1c06686](https://github.com/hujiulong/gcoord/commit/1c066864ddf5e4e23d67d041e333f60b61955b67))
* support web mercator projection([#2](https://github.com/hujiulong/gcoord/issues/2)) ([8d230d4](https://github.com/hujiulong/gcoord/commit/8d230d42800452efafb3e1bfa0209becceb6d6e9))



