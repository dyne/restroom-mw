const dotenv = require("dotenv");
require("mocha");
const expect = require("chai").expect;
dotenv.config({ path: ".env" });

const { Zencode } = require("../dist/index");

describe("zencode", () => {
  it("should be an object", () => {
    expect(Zencode).to.be.a("function");
  });

  it("should be a Zencode istance", () => {
    const content =
      "Given nothing\nWhen I create the array of '16' random objects of '32' bits\nThen print all data";
    const contract = new Zencode(content);
    expect(contract).to.be.instanceOf(Zencode);
  });

  it("should Zencode properties work", () => {
    const content = `rule check version 1.0.0
      rule unknown ignore
      Scenario simple: Some scenario description
      Given nothing
      When I create the array of '16' random objects of '32' bits
      Then print all data
    `;
    const contract = new Zencode(content);
    expect(contract.summary).to.be.equal("Some scenario description");
    expect(contract.tag).to.be.equal("simple");
    expect(contract.scenario).to.be.equal(
      "Scenario simple: Some scenario description"
    );
    expect(contract.content).to.be.equal(content);
  });

  it("should not break with undefined scenario", () => {
    const content = `Given nothing
    When nothing
    Then print all data`;
    const contract = new Zencode(content);
    expect(contract.scenario).to.be.equal(null);
    expect(contract.summary).to.be.equal("");
  });

  it("should parse contracts", () => {
    const content = `rule check version 1.0.0
      rule unknown ignore
      Scenario simple: Some scenario description
      Given nothing
      When I create the array of '16' random objects of '32' bits
      Then print all data
    `;
    const contract = new Zencode(content);
    const p = contract.parse();
    expect(p).to.be.a("Map");
    expect(p).to.be.have.keys([
      "nothing",
      "I create the array of {} random objects of {} bits",
      "print all data",
      "rule unknown ignore",
      "",
      "Scenario simple: Some scenario description",
      "rule check version 1.0.0",
    ]);
  });

  it("should match sentenceIds", () => {
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
      expect(contract.match(sid)).to.be.true;
    }
  });

  it("should give me params", () => {
    const content = `rule check version 1.0.0
      rule unknown ignore
      Scenario simple: Some scenario description
      Given nothing
      When I create the array of '16' random objects of '32' bits
      Then print all data
    `;
    const contract = new Zencode(content);
    const sid = "I create the array of {} random objects of {} bits";
    expect(contract.paramsOf(sid)).to.deep.equal(["16", "32"]);
  });

  it("should load contracts by path", () => {
    const path = "../../test/fixtures/database.zen";
    const contract = Zencode.fromPath(path);
    expect(contract.tag).to.be.equal("storage");
  });

  it("should load contracts by name and path", () => {
    const path = "../../test/fixtures/";
    const contract = Zencode.byName("database", path);
    expect(contract.tag).to.be.equal("storage");
  });
});
