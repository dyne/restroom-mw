import test from "ava";

test.afterEach(t => { 
  delete process.env.HTTP_PORT;
  delete process.env.HTTPS_PORT;
  delete process.env.HOST;
  delete process.env.ZENCODE_DIR;
  delete process.env.CUSTOM_404_MESSAGE;
})

test("Exception without ZENCODE_DIR", (t) => {
  const error = t.throws(() => {
    const { HTTP_PORT } = require("..");
  });

  t.is(error.message, "You must define `ZENCODE_DIR` before proceding");
});

test("HTTP_PORT default should work", t => { 
  process.env.ZENCODE_DIR = './test/fixtures'
  const {HTTP_PORT} = require("..")
  t.is(3000, HTTP_PORT)
});

test("HTTPS_PORT default should work", t => { 
  process.env.ZENCODE_DIR = './test/fixtures'
  const {HTTPS_PORT} = require("..")
  t.is(8443, HTTPS_PORT)
});

test("HOST default should work", t => { 
  process.env.ZENCODE_DIR = './test/fixtures'
  const {HOST} = require("..")
  t.is("0.0.0.0", HOST)
});

test("ZENCODE_DIR should work", t => { 
  process.env.ZENCODE_DIR = './test/fixtures'
  const {ZENCODE_DIR} = require("..")
  t.is("./test/fixtures", ZENCODE_DIR)
});

process.env.CUSTOM_404_MESSAGE = 'Ooops 404'

test("CUSTOM_404_MESSAGE should work", t => { 
  process.env.ZENCODE_DIR = './test/fixtures'
  const {CUSTOM_404_MESSAGE} = require("..")
  t.is("Ooops 404", CUSTOM_404_MESSAGE)
});
