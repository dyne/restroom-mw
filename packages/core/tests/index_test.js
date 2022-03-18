import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
process.env.ZENCODE_DIR = "./test/fixtures";
const core = require("../../core").default;

test("Check that the middleware handle wrong identation in yaml", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/bad-identation-chain.chain");

  t.true(res.body.exception.includes("bad indentation of a mapping entry"));
  t.is(res.status, 500);
});

test("Check that the middleware handle missing start in yaml", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/missing-start.chain");

  t.true(
    res.body.exception.includes(
      "Yml is incomplete. Start (start:) first level definition is missing!"
    )
  );
  t.is(res.status, 500);
});

test("Check that the middleware detects a loop in yaml", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/detect-loop.chain");

  t.true(res.body.exception.includes("Loop detected in chain. Execution is aborted"));
  t.is(res.status, 500);
});

test("Check that the middleware detects when zenfile is missing into contract block", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/missing-zenfile.chain");

  t.true(res.body.exception.includes("Zen file is missing for block id"));
  t.is(res.status, 500);
});

test("Check that the middleware provide context when debug is on for missing zenfile", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/missing-zenfile-debug.chain");

  t.is(res.body.context.debugEnabled, true);
  t.is(res.status, 500);
});

test("Check that the middleware provide context when debug is on for gpp sawroom sample", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/gpp-sawroom-sample-debug.chain");

  t.is(res.body.context.debugEnabled, true);
  t.is(res.status, 200);
});

test("Check that the middleware detects a duplicated mapping key in yaml blocks", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/duplicated-mapping-key.chain");

  t.true(res.body.exception.includes("YAMLException: duplicated mapping key"));
  t.is(res.status, 500);
});

test("Check that the middleware detects two different paths in yml", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/different-paths.chain");

  t.true(
    res.body.exception.includes(
      "Permission Denied. The paths in the yml cannot be different"
    )
  );
  t.is(res.status, 500);
});

test("Check that the middleware is able to execute for each chain with for each input as a map", async (t) => {
  const _data = { 
    data: {
      "myUsers": {
        "Pippo": {"password": "p1pp0"}, 
        "Topolino": {"password": "t0p0l1n0"}, 
        "Pluto": {"password": "plut0"},
        "Paperino": {"password": "p4p3r1n0"}
      }
    }, 
    keys: {} 
  };
  
  const app = express();
  app.use(bodyParser.json());
  app.use("/api/*", core);

  const res = await request(app)
    .post("/api/gpp-sawroom-sample-foreach.chain")
    .send(_data)

    t.is(res.body.myUsers.Pippo.password, "p1pp0");
    t.is(res.body.myUsers.Topolino.password, "t0p0l1n0");
    t.is(res.body.myUsers.Pluto.password, "plut0");
    t.is(res.body.myUsers.Paperino.password, "p4p3r1n0");
    t.is(res.status, 200);

});

test("Check that the middleware is able to execute for each chain with for each input as a map with debug mode on", async (t) => {
  const _data = { 
    data: {
      "myUsers": {
        "Pippo": {"password": "p1pp0"}, 
        "Topolino": {"password": "t0p0l1n0"}, 
        "Pluto": {"password": "plut0"},
        "Paperino": {"password": "p4p3r1n0"}
      }
    }, 
    keys: {} 
  };
  
  const app = express();
  app.use(bodyParser.json());
  app.use("/api/*", core);

  const res = await request(app)
    .post("/api/gpp-sawroom-sample-foreach-debug.chain")
    .send(_data)

    t.is(res.body.myUsers['Pippo'].password, "p1pp0");
    t.is(res.body.myUsers.Topolino.password, "t0p0l1n0");
    t.is(res.body.myUsers.Pluto.password, "plut0");
    t.is(res.body.myUsers.Paperino.password, "p4p3r1n0");
    t.is(res.body.context.debugEnabled, true);
    t.is(res.status, 200);

});

test("Check that the middleware is stopping if start in yml points nowhere", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/start-pointing-nowhere.chain");

  t.true(
    res.body.exception.includes(
      "Start (start:) is pointing nowhere!"
    )
  );
  t.is(res.status, 500);
});

test("Check that the middleware is stopping if one of the next in yml points nowhere", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/next-pointing-nowhere.chain");

  t.true(
    res.body.exception.includes(
      "Next (next:) is pointing nowhere for current block"
    )
  );
  t.is(res.status, 500);
});

test("Check that the middleware is able to execute for each chain with for each input list of objects with debug mode on", async (t) => {
  const _data = { 
    data: {
      "myUsers": [{
        "currentUser": "Pippo",
        "password": "p1pp0"
      },{
        "currentUser": "Topolino",
        "password": "t0p0l1n0"
      },{
        "currentUser": "Pluto",
        "password": "plut0"
      }, {
        "currentUser": "Paperino",
        "password": "p4p3r1n0"
      }]
    }, 
    keys: {} 
  };
  
  const app = express();
  app.use(bodyParser.json());
  app.use("/api/*", core);

  const res = await request(app)
    .post("/api/gpp-sawroom-sample-foreach-debug.chain")
    .send(_data)

    t.is(res.body.myUsers[0].password, "p1pp0");
    t.is(res.body.myUsers[1].password, "t0p0l1n0");
    t.is(res.body.myUsers[2].password, "plut0");
    t.is(res.body.myUsers[3].password, "p4p3r1n0");
    t.is(res.body.context.debugEnabled, true);
    t.is(res.status, 200);

});

test("Check that the middleware is removing index middle property in for each", async (t) => {
  const _data = { 
    data: {
      input:{
      1:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://194.195.240.46:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748545",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"194.195.240.46",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      2:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://50.116.61.250:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748658",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"50.116.61.250",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      3:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://194.195.123.140:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748939",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"194.195.123.140",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      4:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://45.33.44.32:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748756",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"45.33.44.32",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      5:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://172.105.105.137:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748663",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"172.105.105.137",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      6:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://172.105.33.141:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748727",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"172.105.33.141",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      }
     }
    }, 
    keys: {} 
  };
  
  const app = express();
  app.use(bodyParser.json());
  app.use("/api/*", core);

  const res = await request(app)
    .post("/api/consensusroom-test-foreach.chain")
    .send(_data)

    t.is(res.body.temp, undefined);
    t.is(res.status, 200);

});

test("Check that the middleware is handling if index is not filled for each", async (t) => {
  const _data = { 
    data: {
      input:{
      1:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://194.195.240.46:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748545",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"194.195.240.46",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      2:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://50.116.61.250:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748658",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"50.116.61.250",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      3:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://194.195.123.140:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748939",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"194.195.123.140",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      4:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://45.33.44.32:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748756",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"45.33.44.32",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      5:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://172.105.105.137:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748663",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"172.105.105.137",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      },
      6:{
        "announce":"/api/consensusroom-announce",
        "baseUrl":"http://172.105.33.141:3300",
        "get-6-timestamps":"/api/consensusroom-get-6-timestamps",
        "myTimestamp":"1647427748727",
        "public_key":"BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
        "timestampAPI":"/api/consensusroom-get-timestamp",
        "uid":"172.105.33.141",
        "updateAPI":"/api/consensusroom-update",
        "version":"1"
      }
     }
    }, 
    keys: {} 
  };
  
  const app = express();
  app.use(bodyParser.json());
  app.use("/api/*", core);

  const res = await request(app)
    .post("/api/consensusroom-test-foreach-temp1.chain")
    .send(_data)
    
    t.true(res.body.zenroom_errors.logs.includes("Cannot find 'temp' anywhere"));
    t.is(res.status, 500);

});