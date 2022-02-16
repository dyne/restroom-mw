# @restroom-mw/timestamp

## Usage

```js
import express from "express";
import zencode from "@restroom-mw/core";
import timestamp from "@restroom-mw/timestamp";

const app = express();

app.use(timestamp);
app.use("/api/*", zencode);
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [actions](#actions)

### actions

[packages/timestamp/src/index.ts:10-12](https://github.com/dyne/restroom-mw/blob/192df053c814811acf9d9034b1b12a49258d606c/packages/timestamp/src/index.ts#L10-L12 "Source code on GitHub")

**TIMESTAMP** `fetch the local timestamp and store it into {}`