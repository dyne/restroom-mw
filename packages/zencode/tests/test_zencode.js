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
      Then print all data
    `;
  const contract = new Zencode(content);
  const p = contract.parse();
  t.truthy(p instanceof Map);
  const keys = [
    "nothing",
    "I create the array of {} random objects of {} bits",
    "print all data",
    "rule unknown ignore",
    "",
    "Scenario simple: Some scenario description",
    "rule check version 1.0.0",
  ];
  for (const k of keys) {
    t.truthy(p.has(k));
  }
});

test("Should match sentenceIds", (t) => {
  const content = `rule check version 1.0.0
      rule unknown ignore
      Scenario simple: Some scenario description
      Given nothing
      When I create the array of '16' random objects of '32' bits
      Then print all data
    `;
  const contract = new Zencode(content);
  const sentenceIds = [
    "nothing",
    "I create the array of {} random objects of {} bits",
    "print all data",
    "rule unknown ignore",
    "",
    "Scenario simple: Some scenario description",
    "rule check version 1.0.0",
  ];

  for (const sid of sentenceIds) {
    t.truthy(contract.match(sid));
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
  const sid = "I create the array of {} random objects of {} bits";
  t.deepEqual(contract.paramsOf(sid), ["16", "32"]);
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
