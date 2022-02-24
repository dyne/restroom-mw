# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0](https://github.com/dyne/restroom-mw/compare/v0.11.0...v0.12.0) (2022-02-24)


### Features

* **files:** 💾 @restroom-mw/files enables play with remote zip files ([#114](https://github.com/dyne/restroom-mw/issues/114)) ([a4cb8a1](https://github.com/dyne/restroom-mw/commit/a4cb8a16453a6d6530d187ab0889c7824ebb1655))





# [0.11.0](https://github.com/dyne/restroom-mw/compare/v0.10.0...v0.11.0) (2022-02-18)


### Bug Fixes

* no error is thrown if fabric middleware is included but not used ([#100](https://github.com/dyne/restroom-mw/issues/100)) ([d570e09](https://github.com/dyne/restroom-mw/commit/d570e09fe969bda02e61fcdbed7005e83c7ac3a0))


### Features

* **create:** Add --all,--zencode-dir utility options and load .env in template ([#108](https://github.com/dyne/restroom-mw/issues/108)) ([456b806](https://github.com/dyne/restroom-mw/commit/456b806d045ceca04a4718c897be01a29b657cbb))
* **fabric:** Store and retrieve zenroom objects on fabric ([#107](https://github.com/dyne/restroom-mw/issues/107)) ([d02f161](https://github.com/dyne/restroom-mw/commit/d02f16135e1123b89bbdaa73a6529585c23c64d9))





# [0.10.0](https://github.com/dyne/restroom-mw/compare/v0.9.2...v0.10.0) (2022-02-16)


### Bug Fixes

* 🐛 tests update keys as it's being passed and rewritten ([#59](https://github.com/dyne/restroom-mw/issues/59)) ([52a91e7](https://github.com/dyne/restroom-mw/commit/52a91e7072b1a35f101d3aa8071e0d821dfb7fdc))
* Added check for the path in chains ([#87](https://github.com/dyne/restroom-mw/issues/87)) ([f7dd201](https://github.com/dyne/restroom-mw/commit/f7dd20129be2833f0877bf68a10d704d47f5a73e))
* **chain:** Prevent and handle infinte loop in chain execution ([#73](https://github.com/dyne/restroom-mw/issues/73)) ([61a5f06](https://github.com/dyne/restroom-mw/commit/61a5f06917d489fc8929d5d9f8cfc4586b1b96c3)), closes [#72](https://github.com/dyne/restroom-mw/issues/72)
* **core:** 📦 update zenroom and zencode dep to edge ([#61](https://github.com/dyne/restroom-mw/issues/61)) ([71b1ffe](https://github.com/dyne/restroom-mw/commit/71b1ffe640dbca546d85968afcc015a271e3f6e8))
* **db:** 🐛  Fix the database write on tables ([b2a14e4](https://github.com/dyne/restroom-mw/commit/b2a14e4e614518e078a7db66bd32653dd1f66498)), closes [#45](https://github.com/dyne/restroom-mw/issues/45)
* **http:** 🐛  Fix http post on endpoints ([#48](https://github.com/dyne/restroom-mw/issues/48)) ([3432ea9](https://github.com/dyne/restroom-mw/commit/3432ea95d25aec96f308cbde4674091de0b9fdd6)), closes [#47](https://github.com/dyne/restroom-mw/issues/47)
* **http:** 🐞 Fixed http send to ([#70](https://github.com/dyne/restroom-mw/issues/70)) ([a9239e6](https://github.com/dyne/restroom-mw/commit/a9239e64a887c2e41765490e114b200ff7d16f58))
* **http:** check broken url before making the call ([#65](https://github.com/dyne/restroom-mw/issues/65)) ([380ea74](https://github.com/dyne/restroom-mw/commit/380ea741446ee0a76192a95bb2b96f31ef6484fe))
* null object keys or values for yaml chain ([#90](https://github.com/dyne/restroom-mw/issues/90)) ([62175ce](https://github.com/dyne/restroom-mw/commit/62175ceff0dc6bf17cce7908177301ea6746bfc6))
* **redis:** Unmarshal string on retrieve from redis ([#84](https://github.com/dyne/restroom-mw/issues/84)) ([2b8285e](https://github.com/dyne/restroom-mw/commit/2b8285e3885d1a0df4d11909f59dab7ff514f669))
* **sawroom:** ⬆️  Missing dependency ([5ac993a](https://github.com/dyne/restroom-mw/commit/5ac993a41dac906560998ea999820cbbfeb07e69))
* **sawroom:** 🐛  Missing borc ([92200e6](https://github.com/dyne/restroom-mw/commit/92200e6eb7761f2ac3c1d75de861b70a89975539))
* **sawroom:** 🐛  Prevent double parse, since is done in @dyne/sawroom-client ([dccef52](https://github.com/dyne/restroom-mw/commit/dccef52c37657276bad1d805af336c8169ee4467))
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
* shiny Timestamp mw package ([#89](https://github.com/dyne/restroom-mw/issues/89)) ([7d95235](https://github.com/dyne/restroom-mw/commit/7d952353fd830e92b05e83dfe5ee7cb734946559)), closes [#86](https://github.com/dyne/restroom-mw/issues/86)
* Updated Sawroom Wallet statements ([#55](https://github.com/dyne/restroom-mw/issues/55)) ([da957ae](https://github.com/dyne/restroom-mw/commit/da957aebf46d2eb01c39f4d55bfef2c7c10ae8be))





## [0.9.2](https://github.com/dyne/restroom-mw/compare/v0.9.1...v0.9.2) (2020-12-15)


### Bug Fixes

* **sawroom:** 🐛  Read and write json objects on sawroom ([e8c8393](https://github.com/dyne/restroom-mw/commit/e8c83938c64086af2ab5ca85b7c450487b355b1d))





## [0.9.1](https://github.com/dyne/restroom-mw/compare/v0.9.0...v0.9.1) (2020-12-08)

**Note:** Version bump only for package restroom-mw





# [0.9.0](https://github.com/dyne/restroom-mw/compare/v0.8.1...v0.9.0) (2020-12-08)


### Features

* **sawroom:** ✨  Sawroom middleware ([#28](https://github.com/dyne/restroom-mw/issues/28)) ([a83fc77](https://github.com/dyne/restroom-mw/commit/a83fc77736a90fea535d763c1f7899e1748d6cea))
* **zencode:** ✨  Mimic zenroom contract parsing ([680d712](https://github.com/dyne/restroom-mw/commit/680d71205cc1486fa05f12f637eceaadf0cb79c6))


### Performance Improvements

* **ui:** ⚡️  Faster fs traversing ([a398c48](https://github.com/dyne/restroom-mw/commit/a398c4805b7628e411fd14ae1db4abe15f22c41c))


### BREAKING CHANGES

* **zencode:** midlleware should be carefully updated to match correctly the senteces in Zencode class





## [0.8.1](https://github.com/dyne/restroom-mw/compare/v0.8.0...v0.8.1) (2020-12-01)

**Note:** Version bump only for package restroom-mw





# [0.8.0](https://github.com/dyne/restroom-mw/compare/v0.7.1...v0.8.0) (2020-12-01)


### Features

* **db:** Updated db middleware with new ACTIONS ([#26](https://github.com/dyne/restroom-mw/issues/26)) ([8b89c2b](https://github.com/dyne/restroom-mw/commit/8b89c2bc24606ab6d26de735547d35a750bf8c3f)), closes [#22](https://github.com/dyne/restroom-mw/issues/22)





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


### Bug Fixes

* **ui:** 🐛  catch unhandled promise rejection on folder scan for zencodes ([523d038](https://github.com/dyne/restroom-mw/commit/523d03811f61a9ba22801221b06b5260f8f3fc9c))





# [0.6.0](https://github.com/dyne/restroom-mw/compare/v0.5.0...v0.6.0) (2020-11-07)


### Bug Fixes

* **core:** 💥  Remove setData/getData in favour of direct manipulatino of paramsetDa ([2b1db26](https://github.com/dyne/restroom-mw/commit/2b1db26e3d6619606aea06a401d34688ef32e0ab)), closes [#13](https://github.com/dyne/restroom-mw/issues/13)


### Features

* **core:** 💥  Error management, promise hooks and zenroom@next ([8a73590](https://github.com/dyne/restroom-mw/commit/8a735900a8b7629bab45015a69ce82d3eee5ce09)), closes [#14](https://github.com/dyne/restroom-mw/issues/14) [#14](https://github.com/dyne/restroom-mw/issues/14)





# [0.5.0](https://github.com/dyne/restroom-mw/compare/v0.4.5...v0.5.0) (2020-10-16)


### Features

* **db:** ✨ Implements and close [#5](https://github.com/dyne/restroom-mw/issues/5) ([f8af948](https://github.com/dyne/restroom-mw/commit/f8af9488d0719d50796f1c613b91c2d32cd0f3c8))
* **db:** ✨ Implements [#4](https://github.com/dyne/restroom-mw/issues/4) ([8a1a7a2](https://github.com/dyne/restroom-mw/commit/8a1a7a2dc40fc05e8b6ea13bf9bd614cda34e8f2))
