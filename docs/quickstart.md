# Getting Started

Create Restroom is an officially supported way to create RESTroom powered
applications. It offers a modern build setup with no configuration.

## Quick Start

```sh
npx create-restroom my-restroom
cd my-restroom
npm start
```

> If you've previously installed `create-restroom` globally via `npm install -g create-restroom`, we recommend you uninstall the package using `npm uninstall -g create-restroom` or `yarn global remove create-restroom` to ensure that `npx` always uses the latest version.

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

Then open [http://localhost:3000/](http://localhost:3000/) to see your app.

### Get Started Immediately

You **don’t** need to install or configure tools like webpack or Babel. They are preconfigured and hidden so that you can focus on the code.

Create a project, and you’re good to go.

## Creating an App

**You’ll need to have Node >= 14 on your local development machine** (but it’s not required on the server). You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to switch Node versions between different projects.

To create a new app, you may choose one of the following methods:

### npx

```sh
npx create-restroom my-restroom
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

### npm

```sh
npm init restroom my-restroom
```

_`npm init <initializer>` is available in npm 6+_

### Yarn

```sh
yarn create restroom my-restroom
```

_`yarn create` is available in Yarn 0.25+_

### Selecting a package manager

When you create a new app, the CLI will use [npm](https://docs.npmjs.com) or [Yarn](https://yarnpkg.com/) to install dependencies, depending on which tool you use to run `create-restroom`. For example:

```sh
# Run this to use npm
npx create-restroom my-restroom
# Or run this to use yarn
yarn create restroom my-restroom
```

## Output

Running any of these commands will ask you for the middlewares to install, and will create a directory called `my-restroom` inside the current folder. Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-restroom
├── contracts
├── node_modules
├── package.json
├── restroom.mjs
└── yarn.lock
```

No configuration or complicated folder structures, only the files you need to build your app. Once the installation is done, you can open your project folder:

```sh
cd my-restroom
```

!> Once you finished the installation you have to populate the `contracts` folder with you `.zen` or `.chain` smart contracts

## Scripts

Inside the newly created project, you can run some built-in commands:

### `npm start` or `yarn start`

Runs the app in development mode.
It exposes your rest api under http://localhost/api and if you choose to install also the @restroom-mw/ui a OpenApi page is automagically built and served on [http://localhost:3000/docs](http://localhost:3000/docs) that you can view in the browser.

The page will automatically reload if you make changes to the contracts.

![](./images/swagger.png)
