# Build your own

!> This documentation assumes that you have a javascript basic knowledge and you already know how to play with [Express](https://expressjs.com), setup a npm project and install dependencies, all arguments that are out of the scope of this documentation

Create a new restroom is as easy as to plug the [@restroom-mw/core](/packages/core) app
into an express instance.

But before jump into the code you have to configure an ENVIRONMENT VARIABLE `ZENCODE_DIR` that tells to restroom where to look for the zencode contracts.

Or you can create a `.env` file (in the spirit of the [twelve-factor app](https://12factor.net/config)) in the root folder of your project with the following content:

```ini
ZENCODE_DIR=/your/path/to/contracts
```

Once the ENV variable is defined you want to put a contract in that folder, let's call
it `random.zen` with the following content:

[](./links/random.zen ':include :type=code gherkin')

Finally you can procede and create an `app.js`

```js
import express from "express";
import bodyParser from "body-parser";
import core from "@restroom-mw/core";
import { HTTP_PORT, HOST, ZENCODE_DIR } from "@restroom-mw/utils";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("json spaces", 2);

app.use("/api/*", core);

app.listen(HTTP_PORT, HOST, () => {
  console.log("Restroom started\n");
  console.log(`ZENCODE DIR: ${ZENCODE_DIR}\n`);
});
```

and run it (eg. `node app.js`).

The code is very simple, the important line is

```js
app.use("/api/*", core);
```

that bind all the `POST` endpoints under `/api` to execute the [@restroom-mw/core](/packages/core) middleware.

The [@restroom-mw/core](/packages/core) reads all the files inside the `ZENCODE_DIR` and create the endpoints based on the filename. So `random.zen` is served under `/api/random`

You can check it by yourself and test the result with

```bash
curl -X POST "http://localhost:3000/api/random"
```

That should print something like

```json
{
  "array": [
    "YxzYZZMJY5ZvisYichhjLzT6xkCsdu71wV65rHPWV1Q",
    "tAwcDvB-dYvBHiOPZmpP56DLrC6YiJBpXcFHnEiTF1Q",
    "DngBGRUpwyUDu4GI6fyAWjB3wEKlK8DOoefUvhMlloE",
    "i4JlQL9hpxmvm6pZ4p4ur9CBw6Rt3DMC9cSjDQTOX3s",
    "0zuXvJimUKMRUwEzZsEoQGQl7ZEm4pRVN6gIyhzY43E"
  ]
}
```

That's all folks!
