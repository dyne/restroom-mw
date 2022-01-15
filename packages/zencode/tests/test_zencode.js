import test from "ava";
import { Zencode } from "..";

test("Should be an object", (t) => {
  t.is(typeof Zencode, "function");
});

test("Should be Zencode instance", (t) => {
  const content =
    "Given nothing\nWhen I create the array of '16' random objects of '32' bits\nThen print all data";
  const contract = new Zencode(content);
  t.truthy(contract instanceof Zencode);
});

test("Should Zencode properties work", (t) => {
  const content = `rule check version 1.0.0
      rule unknown ignore
      Scenario simple: Some scenario description
      Given nothing
      When I create the array of '16' random objects of '32' bits
      Then print all data
    `;
  const contract = new Zencode(content);
  t.is(contract.summary, "Some scenario description");
  t.is(contract.tag, "simple");
  t.is(contract.scenario, "Scenario simple: Some scenario description");
  t.is(contract.content, content);
});

test("Should not break with undefined scenario", (t) => {
  const content = `Given nothing
    When nothing
    Then print all data`;
  const contract = new Zencode(content);
  t.is(contract.scenario, null);
  t.is(contract.summary, "");
});

test("Should parse contracts", (t) => {
  const content = `rule check version 1.0.0
      rule unknown ignore
      Scenario simple: Some scenario description
      Given nothing
      When I create the array of '16' random objects of '32' bits
      Then print all data`;
  const contract = new Zencode(content);
  const p = contract.parse();
  t.truthy(p instanceof Map);
  const keys = [
    "rule check version 1.0.0",
    "rule unknown ignore",
    "Scenario simple: Some scenario description",
    "nothing",
    "create the array of {} random objects of {} bits",
    "print data",
  ];
  t.deepEqual([...p.keys()], keys);
});

test("Should match sentenceIds", (t) => {
  const content = `rule check version 2.0.0
      rule unknown ignore
      Scenario simple: Some scenario description
      Given nothing
      When I create the array of '16' random objects of '32' bits
      Then print all data
    `;
  const contract = new Zencode(content);
  const sentenceIds = [
    "rule check version 2.0.0",
    "rule unknown ignore",
    "Scenario simple: Some scenario description",
    "nothing",
    "create the array of {} random objects of {} bits",
    "print data",
    "",
  ];

  for (const sid of sentenceIds) {
    t.true(contract.match(sid));
  }
});

test("should give me params", (t) => {
  const content = `rule check version 1.0.0
      rule unknown ignore
      Scenario simple: Some scenario description
      Given nothing
      When I create the array of '16' random objects of '32' bits
      Then print all data
    `;
  const contract = new Zencode(content);
  const sid = "create the array of {} random objects of {} bits";
  t.deepEqual(contract.paramsOf(sid), [["16", "32"]]);
});

test("should load contracts by path", (t) => {
  const path = "./test/fixtures/database.zen";
  const contract = Zencode.fromPath(path);
  t.is(contract.tag, "storage");
});

test("should load contracts by name and path", (t) => {
  const path = "./test/fixtures/";
  const contract = Zencode.byName("database", path);
  t.is(contract.tag, "storage");
});

test("should not broke with keywords in the middle", (t) => {
  const contract = `Rule unknown ignore 
Scenario 'ecdh': Create the keypair
Given that I am known as 'Alice'
Given that I have an endpoint named 'https://jsonplaceholder.typicode.com/todos/1'
Given I connect to 'myEndPoint' and save the output into 'myApiOutput'
When I create the random object of '1024' bits
When I test
Then pass the output to 'myOutputEndPoint' into 'data'
Then print all data`;

  const zencode = new Zencode(contract);
  const ACTIONS = {
    TEST: "connect to {} and save the output into {}",
  };
  t.truthy(zencode.match(ACTIONS.TEST));
  const [[source, dest]] = zencode.paramsOf(ACTIONS.TEST);
  t.is(source, "myEndPoint");
  t.is(dest, "myApiOutput");
});

test("should handle correctly duplicated sentences", (t) => {
  const content = `Given I am I
  and I am I
  and I define 'alice'
  and I define 'bob'`;

  const SENTENCES = {
    I: "am I",
    DEFINE: "define {}",
  };
  const zencode = new Zencode(content);

  t.true(zencode.match(SENTENCES.I));
  t.true(zencode.match(SENTENCES.DEFINE));
  t.deepEqual(["alice", "bob"], zencode.paramsOf(SENTENCES.DEFINE));
});

test("should handle correctly duplicated sentences with multiple param in one sentence", (t) => {
  const content = `Given I am I
  and I am I
  and I define 'alice' and love 'bob'
  and I define 'bob' and love 'alice'
  and I define 'bob' and love 'charlie'`;

  const SENTENCES = {
    I: "am I",
    DEFINE: "define {} and love {}",
  };
  const zencode = new Zencode(content);

  t.true(zencode.match(SENTENCES.I));
  t.true(zencode.match(SENTENCES.DEFINE));
  t.deepEqual(
    [
      ["alice", "bob"],
      ["bob", "alice"],
      ["bob", "charlie"],
    ],
    zencode.paramsOf(SENTENCES.DEFINE)
  );
});

test("handle multiple params", (t) => {
  const content = `
  Given nothing
  and 'one' for 'two' or 'three'
  and '1' for '2' or '3'
  `;
  const SENTENCES = {
    three: "{} for {} or {}",
  };
  const zencode = new Zencode(content);
  t.true(zencode.match(SENTENCES.three));
  t.deepEqual(
    [
      ["one", "two", "three"],
      ["1", "2", "3"],
    ],
    zencode.paramsOf(SENTENCES.three)
  );
});
