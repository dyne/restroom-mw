# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.10.0](https://github.com/dyne/restroom-mw/compare/v0.9.2...v0.10.0) (2022-02-16)


### Bug Fixes

* Added check for the path in chains ([#87](https://github.com/dyne/restroom-mw/issues/87)) ([f7dd201](https://github.com/dyne/restroom-mw/commit/f7dd20129be2833f0877bf68a10d704d47f5a73e))
* **chain:** Prevent and handle infinte loop in chain execution ([#73](https://github.com/dyne/restroom-mw/issues/73)) ([61a5f06](https://github.com/dyne/restroom-mw/commit/61a5f06917d489fc8929d5d9f8cfc4586b1b96c3)), closes [#72](https://github.com/dyne/restroom-mw/issues/72)
* **core:** 📦 update zenroom and zencode dep to edge ([#61](https://github.com/dyne/restroom-mw/issues/61)) ([71b1ffe](https://github.com/dyne/restroom-mw/commit/71b1ffe640dbca546d85968afcc015a271e3f6e8))
* null object keys or values for yaml chain ([#90](https://github.com/dyne/restroom-mw/issues/90)) ([62175ce](https://github.com/dyne/restroom-mw/commit/62175ceff0dc6bf17cce7908177301ea6746bfc6))
* Use ids as contract map keys for chains avoiding execution loops ([#91](https://github.com/dyne/restroom-mw/issues/91)) ([f274a5a](https://github.com/dyne/restroom-mw/commit/f274a5a7b3987ea06eedcdf64a9d81453a7f6f9d))


### Features

* ✨ Allow execution of .chain (⛓ flow of contracts)  ([#56](https://github.com/dyne/restroom-mw/issues/56)) ([eeb52ee](https://github.com/dyne/restroom-mw/commit/eeb52eed5724dd8455a33d60d71c62d461cbd81f))
* ✨ read yaml or json in keys files ([#77](https://github.com/dyne/restroom-mw/issues/77)) ([63a04dc](https://github.com/dyne/restroom-mw/commit/63a04dc9d638fd20f656ad839d091826e26b519a))
* 📢   Enhance message error on chain contracts ([#63](https://github.com/dyne/restroom-mw/issues/63)) ([7772fb4](https://github.com/dyne/restroom-mw/commit/7772fb48499375f2d4c3e6385d73e3f96929f728))
* **fabric:** ⛓ Fabric middleware ([#78](https://github.com/dyne/restroom-mw/issues/78)) ([76038c5](https://github.com/dyne/restroom-mw/commit/76038c51d0d49e4bb6db966292a00b1d2ac44a4a))
* First implementation of the CLI restroom generator ([#99](https://github.com/dyne/restroom-mw/issues/99)) ([cf01853](https://github.com/dyne/restroom-mw/commit/cf01853d0ffdb171aaec34140217d95963fbd936))
* **http:** ✨  POST capabilities to the HTTP module ([#76](https://github.com/dyne/restroom-mw/issues/76)) ([046fc98](https://github.com/dyne/restroom-mw/commit/046fc98f0bf049c85ec59a4727349247d583cdb4)), closes [#75](https://github.com/dyne/restroom-mw/issues/75)
* paraller http ([#88](https://github.com/dyne/restroom-mw/issues/88)) ([b6d4524](https://github.com/dyne/restroom-mw/commit/b6d452486139e588ed3d6347627428168cd513b5)), closes [#79](https://github.com/dyne/restroom-mw/issues/79)
* **sawroom:** ✨  Allow to save the whole zencode execution output directly on Sawroom ([1bc602d](https://github.com/dyne/restroom-mw/commit/1bc602d083e2a99c76ecf3b4dec64c95f06f515f)), closes [#41](https://github.com/dyne/restroom-mw/issues/41)
* **sawroom:** ✨  Implement the RETREVE action from sawroom ([762231c](https://github.com/dyne/restroom-mw/commit/762231c899a5a48fa321fec71c632e78cdf10828))
* **sawroom:** ✨  Write on the sawroom with the new shiny storage-tp ([01ee0d7](https://github.com/dyne/restroom-mw/commit/01ee0d7325bd1fb5a1a3879b118d24dbdabdd0ed))
* **sawroom:** ✨ Add support for wallet in sawroom ([#53](https://github.com/dyne/restroom-mw/issues/53)) ([461de54](https://github.com/dyne/restroom-mw/commit/461de54cdaa60bc6ceeca8a9b25f568fca952b5b))





## [0.9.2](https://github.com/dyne/restroom-mw/compare/v0.9.1...v0.9.2) (2020-12-15)


### Bug Fixes

* **sawroom:** 🐛  Read and write json objects on sawroom ([e8c8393](https://github.com/dyne/restroom-mw/commit/e8c83938c64086af2ab5ca85b7c450487b355b1d))





# [0.9.0](https://github.com/dyne/restroom-mw/compare/v0.8.1...v0.9.0) (2020-12-08)


### Features

* **sawroom:** ✨  Sawroom middleware ([#28](https://github.com/dyne/restroom-mw/issues/28)) ([a83fc77](https://github.com/dyne/restroom-mw/commit/a83fc77736a90fea535d763c1f7899e1748d6cea))





## [0.8.1](https://github.com/dyne/restroom-mw/compare/v0.8.0...v0.8.1) (2020-12-01)

**Note:** Version bump only for package @restroom-mw/core





# [0.8.0](https://github.com/dyne/restroom-mw/compare/v0.7.1...v0.8.0) (2020-12-01)

**Note:** Version bump only for package @restroom-mw/core





## [0.7.1](https://github.com/dyne/restroom-mw/compare/v0.7.0...v0.7.1) (2020-11-20)


### Bug Fixes

* **core:** 🐛  Fix empty object literal data when nothing is expected ([c6e22e2](https://github.com/dyne/restroom-mw/commit/c6e22e2bffa814f6f6177c40acb61f3d4030c77b))
* **http:** 🐛 Make the http work with SSL and fix `Given nothing` sentences ([c614e7c](https://github.com/dyne/restroom-mw/commit/c614e7c94920e6230ff9b2f538148d711f5dbfaf))





# [0.7.0](https://github.com/dyne/restroom-mw/compare/v0.6.3...v0.7.0) (2020-11-18)


### Features

* **http:** :zap: middleware implementation + tests and contracts ([#21](https://github.com/dyne/restroom-mw/issues/21)) ([132c419](https://github.com/dyne/restroom-mw/commit/132c41935160e5d3ff7ba8641096796e219bdc9f))





## [0.6.3](https://github.com/dyne/restroom-mw/compare/v0.6.2...v0.6.3) (2020-11-11)


### Bug Fixes

* **http:** 🐛  Make the http mw work as expected ([5138507](https://github.com/dyne/restroom-mw/commit/5138507b1c8c08703ebbb7d6db76b9d45c64a814)), closes [#18](https://github.com/dyne/restroom-mw/issues/18)


### Performance Improvements

* ⚡️  Parallel building faster dev experience ([6c2a934](https://github.com/dyne/restroom-mw/commit/6c2a934aba83fc88c888078f183105d0531243fe))





## [0.6.2](https://github.com/dyne/restroom-mw/compare/v0.6.1...v0.6.2) (2020-11-08)


### Performance Improvements

* **core:** ⚡️  Prevent EventEmitter memory leak ([fb5b823](https://github.com/dyne/restroom-mw/commit/fb5b823272829273208f314c7bdae0c5c9be050b))





## [0.6.1](https://github.com/dyne/restroom-mw/compare/v0.6.0...v0.6.1) (2020-11-08)

**Note:** Version bump only for package @restroom-mw/core





# [0.6.0](https://github.com/dyne/restroom-mw/compare/v0.5.0...v0.6.0) (2020-11-07)


### Bug Fixes

* **core:** 💥  Remove setData/getData in favour of direct manipulatino of paramsetDa ([2b1db26](https://github.com/dyne/restroom-mw/commit/2b1db26e3d6619606aea06a401d34688ef32e0ab)), closes [#13](https://github.com/dyne/restroom-mw/issues/13)


### Features

* **core:** 💥  Error management, promise hooks and zenroom@next ([8a73590](https://github.com/dyne/restroom-mw/commit/8a735900a8b7629bab45015a69ce82d3eee5ce09)), closes [#14](https://github.com/dyne/restroom-mw/issues/14) [#14](https://github.com/dyne/restroom-mw/issues/14)





# [0.5.0](https://github.com/dyne/restroom-mw/compare/v0.4.5...v0.5.0) (2020-10-16)


### Features

* **db:** ✨ Implements [#4](https://github.com/dyne/restroom-mw/issues/4) ([8a1a7a2](https://github.com/dyne/restroom-mw/commit/8a1a7a2dc40fc05e8b6ea13bf9bd614cda34e8f2))
