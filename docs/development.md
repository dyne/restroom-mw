# Contributing

to setup the environment for development you need start with building

```sh
gh repo clone dyne/restoroom-mw
cd restroom-mw
yarn build
yarn links
```

At this stage you have correctly build and linked all the restroom-mw's
middleware packages ready to be used in your local project.
To know more about package linking take a look at: [yarn link](https://classic.yarnpkg.com/lang/en/docs/cli/link/)

Now you want to download a basic project in a new directory (out of the
restroom-mw repository) by run:
```sh
npx degit https://github.com/dyne/restroom-template
cd restroom-template
yarn link @restroom-mw/core @restroom-mw/core @restroom-mw/db @restroom-mw/http @restroom-mw/redis @restroom-mw/sawroom @restroom-mw/ui @restroom-mw/utils @restroom-mw/zencode
```
now the packages of the `restroom-template` project points to your local
packages build withing the `restroom-mw` source code folder.

NB. Whan you change some code, remember to run `yarn build` in the restoroom-mw
root folder. But you don't have to `link` it again.

# 🖺 Improve documentation

The simplest way to improve the documentation is inside the code, you can always put a Javadoc-like comment and run the command `yarn doc` to generate the documentation. For an example, look at the redis and the files package in the `src/index.ts` file.

To look at the documentation locally you can serve it with `npx docsify-cli serve docs/`


Happy hacking!
