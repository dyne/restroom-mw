# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.12.2](https://github.com/dyne/restroom-mw/compare/v0.12.1...v0.12.2) (2022-02-24)

**Note:** Version bump only for package @restroom-mw/http





## [0.12.1](https://github.com/dyne/restroom-mw/compare/v0.12.0...v0.12.1) (2022-02-24)

**Note:** Version bump only for package @restroom-mw/http





# [0.12.0](https://github.com/dyne/restroom-mw/compare/v0.11.0...v0.12.0) (2022-02-24)

**Note:** Version bump only for package @restroom-mw/http





# [0.11.0](https://github.com/dyne/restroom-mw/compare/v0.10.0...v0.11.0) (2022-02-18)

**Note:** Version bump only for package @restroom-mw/http





# [0.10.0](https://github.com/dyne/restroom-mw/compare/v0.9.2...v0.10.0) (2022-02-16)


### Bug Fixes

* **core:** 📦 update zenroom and zencode dep to edge ([#61](https://github.com/dyne/restroom-mw/issues/61)) ([71b1ffe](https://github.com/dyne/restroom-mw/commit/71b1ffe640dbca546d85968afcc015a271e3f6e8))
* **http:** 🐛  Fix http post on endpoints ([#48](https://github.com/dyne/restroom-mw/issues/48)) ([3432ea9](https://github.com/dyne/restroom-mw/commit/3432ea95d25aec96f308cbde4674091de0b9fdd6)), closes [#47](https://github.com/dyne/restroom-mw/issues/47)
* **http:** 🐞 Fixed http send to ([#70](https://github.com/dyne/restroom-mw/issues/70)) ([a9239e6](https://github.com/dyne/restroom-mw/commit/a9239e64a887c2e41765490e114b200ff7d16f58))
* **http:** check broken url before making the call ([#65](https://github.com/dyne/restroom-mw/issues/65)) ([380ea74](https://github.com/dyne/restroom-mw/commit/380ea741446ee0a76192a95bb2b96f31ef6484fe))
* null object keys or values for yaml chain ([#90](https://github.com/dyne/restroom-mw/issues/90)) ([62175ce](https://github.com/dyne/restroom-mw/commit/62175ceff0dc6bf17cce7908177301ea6746bfc6))
* **redis:** Unmarshal string on retrieve from redis ([#84](https://github.com/dyne/restroom-mw/issues/84)) ([2b8285e](https://github.com/dyne/restroom-mw/commit/2b8285e3885d1a0df4d11909f59dab7ff514f669))


### Features

* ✨ read yaml or json in keys files ([#77](https://github.com/dyne/restroom-mw/issues/77)) ([63a04dc](https://github.com/dyne/restroom-mw/commit/63a04dc9d638fd20f656ad839d091826e26b519a))
* First implementation of the CLI restroom generator ([#99](https://github.com/dyne/restroom-mw/issues/99)) ([cf01853](https://github.com/dyne/restroom-mw/commit/cf01853d0ffdb171aaec34140217d95963fbd936))
* **http:** ✨  POST capabilities to the HTTP module ([#76](https://github.com/dyne/restroom-mw/issues/76)) ([046fc98](https://github.com/dyne/restroom-mw/commit/046fc98f0bf049c85ec59a4727349247d583cdb4)), closes [#75](https://github.com/dyne/restroom-mw/issues/75)
* paraller http ([#88](https://github.com/dyne/restroom-mw/issues/88)) ([b6d4524](https://github.com/dyne/restroom-mw/commit/b6d452486139e588ed3d6347627428168cd513b5)), closes [#79](https://github.com/dyne/restroom-mw/issues/79)





# [0.9.0](https://github.com/dyne/restroom-mw/compare/v0.8.1...v0.9.0) (2020-12-08)


### Features

* **sawroom:** ✨  Sawroom middleware ([#28](https://github.com/dyne/restroom-mw/issues/28)) ([a83fc77](https://github.com/dyne/restroom-mw/commit/a83fc77736a90fea535d763c1f7899e1748d6cea))
* **zencode:** ✨  Mimic zenroom contract parsing ([680d712](https://github.com/dyne/restroom-mw/commit/680d71205cc1486fa05f12f637eceaadf0cb79c6))


### BREAKING CHANGES

* **zencode:** midlleware should be carefully updated to match correctly the senteces in Zencode class





## [0.8.1](https://github.com/dyne/restroom-mw/compare/v0.8.0...v0.8.1) (2020-12-01)

**Note:** Version bump only for package @restroom-mw/http





# [0.8.0](https://github.com/dyne/restroom-mw/compare/v0.7.1...v0.8.0) (2020-12-01)

**Note:** Version bump only for package @restroom-mw/http





## [0.7.1](https://github.com/dyne/restroom-mw/compare/v0.7.0...v0.7.1) (2020-11-20)


### Bug Fixes

* **http:** 🐛 Make the http work with SSL and fix `Given nothing` sentences ([c614e7c](https://github.com/dyne/restroom-mw/commit/c614e7c94920e6230ff9b2f538148d711f5dbfaf))





# [0.7.0](https://github.com/dyne/restroom-mw/compare/v0.6.3...v0.7.0) (2020-11-18)


### Features

* **http:** :zap: middleware implementation + tests and contracts ([#21](https://github.com/dyne/restroom-mw/issues/21)) ([132c419](https://github.com/dyne/restroom-mw/commit/132c41935160e5d3ff7ba8641096796e219bdc9f))





## [0.6.3](https://github.com/dyne/restroom-mw/compare/v0.6.2...v0.6.3) (2020-11-11)


### Bug Fixes

* **http:** 🐛  Make the http mw work as expected ([5138507](https://github.com/dyne/restroom-mw/commit/5138507b1c8c08703ebbb7d6db76b9d45c64a814)), closes [#18](https://github.com/dyne/restroom-mw/issues/18)


### Performance Improvements

* ⚡️  Parallel building faster dev experience ([6c2a934](https://github.com/dyne/restroom-mw/commit/6c2a934aba83fc88c888078f183105d0531243fe))





## [0.6.1](https://github.com/dyne/restroom-mw/compare/v0.6.0...v0.6.1) (2020-11-08)

**Note:** Version bump only for package @restroom-mw/http





# [0.6.0](https://github.com/dyne/restroom-mw/compare/v0.5.0...v0.6.0) (2020-11-07)


### Bug Fixes

* **core:** 💥  Remove setData/getData in favour of direct manipulatino of paramsetDa ([2b1db26](https://github.com/dyne/restroom-mw/commit/2b1db26e3d6619606aea06a401d34688ef32e0ab)), closes [#13](https://github.com/dyne/restroom-mw/issues/13)
