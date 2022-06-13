import test from "ava";

test.afterEach(t => {
  // The following line is not sufficient, I have to delete in each test
  delete require.cache[require.resolve('..')]
  delete process.env.HTTP_PORT;
  delete process.env.HTTPS_PORT;
  delete process.env.HOST;
  delete process.env.ZENCODE_DIR;
  delete process.env.KEYS_DIR;
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
  process.env.ZENCODE_DIR = './test/fixture'
  const {ZENCODE_DIR} = require("..")
  t.is("./test/fixtures", ZENCODE_DIR)
});

test("KEYS_DIR not defined", t => {
  process.env.ZENCODE_DIR = './test/fixture'
  const {KEYS_DIR} = require("..")
  t.is("./test/fixtures", KEYS_DIR)
  delete require.cache[require.resolve('..')]
});

test("KEYS_DIR should work", t => {
  process.env.ZENCODE_DIR = './test/fixture'
  process.env.KEYS_DIR = './test'
  const {KEYS_DIR} = require("..")
  t.is("./test", KEYS_DIR)
  delete require.cache[require.resolve('..')]
});

process.env.CUSTOM_404_MESSAGE = 'Ooops 404'

test("CUSTOM_404_MESSAGE should work", t => {
  process.env.ZENCODE_DIR = './test/fixtures'
  const {CUSTOM_404_MESSAGE} = require("..")
  t.is("Ooops 404", CUSTOM_404_MESSAGE)
});
