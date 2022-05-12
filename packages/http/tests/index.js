import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/http";
const http = require("..").default;
const zencode = require("../../core").default;

test("Middleware db should exists", (t) => {
  t.truthy(typeof http, "object");
});

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.get("/normaljson", (req, res) => {
    const responsejson = {
      userId: 1,
      myArray: [1, 2, 3, 4, 5],
      myStringArary: ["one", "two", "three"],
      myJson: {
        1: "First property",
        2: 123,
        // "3": true
      },
    };
    res.status(200).send(responsejson);
  });
  app.get("/booleanjson", (req, res) => {
    const responsejson = {
      userId: 1,
      myJson: {
        1: "First property",
        2: 123,
        3: true,
      },
    };
    res.status(200).send(responsejson);
  });
  app.post("/sendresult", (req, res) => {
    try {
      if (Object.keys(req.body).includes("myData")) {
        res.status(200).send("received result");
      } else {
        res.status(500).send("Did not receive the result");
      }
    } catch {
      res
        .status(505)
        .send("Something is wrong with the result sent by zenroom");
    }
  });
  app.get("/storeoutput", (req, res) => {
    const output = {
      mySharedSecret: [{
          x: "b6J49SRdmJ3xKSbm4/m1MnE4q4k9PV3QfGmJaXxzSqc=",
          y: "CX25HWpn7wNVbii04JJzUuLGg3iV98RdfexlimnYy4s=",
        },
        {
          x: "r2c5Oqnv3nFDLxeji+t+VHyCbZIqwkPHIINS5e/XZms=",
          y: "toxNY+pjSpHAwYb+XaecxrWn0JsI+QcHeJHcl1bxYSk=",
        },
        {
          x: "S5XL4Eccy5g9wfyYdzz814cQ+50sAK/n+UuqekJUdPQ=",
          y: "MdH2wEsqwq2XtjSoK4oZdmM4FsbcR/3ByOsv0CWc90E=",
        },
        {
          x: "cE7y3I+33bf0Do+hpcoQeQKALKTsalAWOCke1+pYuAE=",
          y: "UAmR+N61zlJKwW6KyoTXwf+4Z3raeWt4Gbax0lQFqME=",
        },
      ],
    };
    res.status(200).send(output);
  });

  app.listen(3020, () => console.log("Server up and running on "));
});

test(
  "Check that the middleware works with simple contract with endpoint in keys",
  async (t) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app).post("/http-test-simple-with-keys");

    t.true(
      Object.keys(res.body).includes("myData"),
      'could not find "myData " in response'
    );
    t.is(res.status, 200);
  });

/*
test("Check that the post with data and save to variable works correctly", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);
  const res = await request(app).post("/http-test-post-and-save");
  t.log(res.data);
  t.true(Object.keys(res.body).includes("result"));
  t.true(Object.keys(res.body).includes("dataFromEndpoint"));
  t.is(res.status, 200);
});
*/

test(
  "Check that the middleware works with simple contract with endpoint in data",
  async (t) => {
    const _data = {
      data: {
        endpoint: "http://localhost:3020/normaljson",
      },
    };

    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app)
      .post("/http-test-simple-with-data")
      .send(_data);

    t.true(
      Object.keys(res.body).includes("myData"),
      'could not find "myData " in response'
    );
    t.is(res.status, 200);
  });

test.skip(
  "Check that the middleware fails with simple contract with endpoint in data responding with boolean in json",
  async (t) => {
    const _data = {
      data: {
        endpoint: "http://localhost:3020/booleanjson",
      },
    };

    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app)
      .post("/http-test-simple-with-data")
      .send(_data);

    t.true(
      res.body.exception.includes("Boolean values are not permitted"),
      "Exception should be thrown when json includes boolean in endpoint response"
    );
    t.is(res.status, 500);
  });

test(
  "Check that the middleware fails with simple contract when no endpoints are defined in zencode",
  async (t) => {
    const _data = {
      data: {
        endpoint: "http://localhost:3020/normaljson",
      },
    };

    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app)
      .post("/http-test-no-enpoints-defined")
      .send(_data);

    t.true(
      res.body.exception.includes(
        "Endpoints are missing, please define them"),
      "Exception should be thrown when no endpoint is defined in zencode"
    );
    t.is(res.status, 500);
  });

test(
  "Check that the middleware throws exception in complex contract when one endpoint is not defined in zencode",
  async (t) => {
    const _data = {
      data: {
        endpoint: "http://localhost:3020/normaljson",
      },
    };

    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app)
      .post("/http-test-enpoind-not-defined")
      .send(_data);

    t.true(
      res.body.exception.includes("has not been defined in zencode,"),
      "Exception should be thrown when endpoint not defined in zencode"
    );
    t.is(res.status, 500);
  });

test(
  "Check that the middleware throws exception in complex contract when endpoint is not defined in keys or data",
  async (t) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app).post("/http-test-simple-with-data");

    t.true(
      res.body.exception.includes("has not been defined in keys or data"),
      "Exception should be thrown when endpoint not defined in keys or data"
    );
    t.is(res.status, 500);
  });

test("Check that the middleware sends the result to endpoint", async (t) => {
  const _data = {
    data: {
      endpoint1: "http://localhost:3020/normaljson",
      endpoint2: "http://localhost:3020/sendresult",
    },
  };

  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);
  const res = await request(app)
    .post("/http-test-endpoint-send-result")
    .send(_data);

  t.is(res.status, 200, res.text);
  t.true(
    Object.keys(res.body).includes("myData"),
    'could not find "myData " in response'
  );
});

test(
  "Check that the middleware throws exception when the endpoint for sending the result is bad",
  async (t) => {
    const _data = {
      data: {
        endpoint1: "http://localhost:3020/normaljson",
        endpoint2: "http://localhost:3020/doesntexist",
      },
    };

    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app)
      .post("/http-test-endpoint-send-result")
      .send(_data);

    t.true(
      res.body.exception.includes("Error sending the result to"),
      "Should throw an error with faulty endpoint url"
    );
    t.is(res.status, 500);
  });

test("Check that the middleware stores the response from endpoint to output",
  async (t) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app).post("/http-test-store-output");

    t.true(
      Object.keys(res.body).includes("myData"),
      'could not find "myData " in response'
    );
    t.is(res.status, 200);
  });

test("Check that the middleware fails with faulty json in keys", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);
  const res = await request(app).post("/http-test-fault-json-keys");

  t.true(
    res.body.exception.includes(
      'Endpoint "endpoint" has not been defined in keys or data'),
    res.body.exception
  );
  t.is(res.status, 500);
});

test(
  "Check that the middleware throws and exception if duplicate end point declarations",
  async (t) => {
    const _data = {
      data: {
        endpoint: "http://localhost:3020/normaljson",
        endpoint2: "http://localhost:3020/normaljson",
      },
    };

    const app = express();
    app.use(bodyParser.json());
    app.use(http);
    app.use("/*", zencode);
    const res = await request(app)
      .post("/http-test-duplicate-enpoints")
      .send(_data);

    t.true(
      res.body.exception.includes("Found a duplicate"),
      "Exception should be thrown if endpoints are declared with the same name"
    );
    t.is(res.status, 500);
  });

test("Parallel get for arrays", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);

  const res = await request(app).post("/http-get-array");
  t.is(res.status, 200);
  t.true(
    Object.keys(res.body).includes("myObject"),
    'could not find "myObject " in response'
  );
});

test("Parallel post for arrays", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);

  const res = await request(app).post("/http-post-array");
  t.is(res.status, 200);
  t.is(res.body.results.length, 3)
  t.is(res.body.allResults.results.length, 3)
});

test("Check broken http", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);

  const res = await request(app).post("/http-test-store");
  t.is(res.status, 200);
});
