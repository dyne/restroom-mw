import fs from "fs";
import ic from "ignore-case";
import { format } from "url";

const quoted = new RegExp(/'[^']*'/, "g");

const getParams = (sentence) => {
  const params = sentence.match(quoted);
  return params ? params.map((p) => p.replace(/'/g, "")) : null;
};

const removeParams = (sentence) => sentence.replace(quoted, "{}");

const removeWords = (sentence, words) => {
  const w = sentence.trim().split(" ");
  const filtered = w.filter((x) => !words.includes(x.toLowerCase()));
  return filtered.join(" ");
};

const removeKeywords = (str) =>
  removeWords(str, ["when", "given", "and", "then"]);

/**
 *
 * @author Puria Nafisi Azizi <puria@dyne.org> @pna
 * @copyright 2020 Dyne.org
 * @license AGPL-3.0-only
 *
 * A zencode class that encapsulated all related methods useful for
 * using contracts in Restroom
 *
 * @param {string} content
 */
export class Zencode {
  constructor(content) {
    this._content = content;
  }

  /**
   * The **Content** of the contract
   * @type {string}
   */
  get content() {
    return this._content;
  }

  /**
   * The sentence that starts with `Scenario:` within the contract.
   * Returns {@link null} if is not present
   * @type {string}
   */
  get scenario() {
    for (const line of this.content.split("\n")) {
      if (ic.startsWith(line.trim(), "SCENARIO")) {
        return line.trim();
      }
    }
    return null;
  }

  __parseDescription(fn) {
    if (this.scenario !== null) {
      const words = this.scenario.split(":");
      if (words) {
        return fn(words);
      }
    }
    return "";
  }

  /**
   * Summary: the description that follows in the first line of the Scenario
   * @type {string}
   */
  get summary() {
    return this.__parseDescription((words) => words[1].trim());
  }

  /**
   * Tag: the very first word of the scenario used as tag to
   * aggregate contracts by scenario
   * @type {string}
   */
  get tag() {
    return this.__parseDescription((words) =>
      words[0].replace(/(Scenario )/i, "")
    );
  }

  /**
   * Creates a easy accessible data structure of the contract
   * In form of a {@link Map} (to ensure order). Each entry has the
   * key of the **sentenceId**.
   * A **sentenceId** is the contract line where the reserved
   * words (`when`, `given`, `and`, `then`) are stripped away
   * and all arguments (whatever is inside a single quote) is
   * replaced with `{}`.
   * The values of the {@link Map} are the parameters of the
   * **sentenceId** in form of an {@link Array}<{@link String}>
   *
   * @example
   * const parsed = new Zencode(`rule check version 1.0.0
   * rule unknown ignore
   * Scenario simple: Some scenario description
   * Given nothing
   * When I create the array of '16' random objects of '32' bits
   * Then print all data`).parse()
   * console.log(parsed)
   * // Map(7) {
   * //   'rule check version 1.0.0' => [],
   * //   'rule unknown ignore' => [],
   * //   'Scenario simple: Some scenario description' => [],
   * //   'nothing' => [],
   * //   'I create the array of {} random objects of {} bits' => [ '16', '32' ],
   * //   'print all data' => [],
   * //   '' => []
   * // }
   *
   * @returns {Map<String, Array<string>>}
   */
  parse() {
    const parsed = new Map();
    for (const line of this.content.split("\n")) {
      const params = getParams(line) || [];
      const lid = removeKeywords(removeParams(line)).trim();
      parsed.set(lid, params);
    }
    return parsed;
  }

  /**
   * Test existence of a sentenceId within the contract
   * @param {string} sentenceId
   * @returns {boolean}
   */
  match(sentenceId) {
    return Array.from(this.parse().keys()).includes(sentenceId);
  }

  /**
   * Return the parameters for a given sentenceId
   * @param {string} sentenceId
   * @returns {Array<string>}
   */
  paramsOf(sentenceId) {
    return this.parse().get(sentenceId);
  }

  /**
   * Create a {@link Zencode} instance from the full path of the contract
   * @param {string} path
   * @returns {Zencode}
   */
  static fromPath(path) {
    const content = fs.readFileSync(path).toString();
    return new Zencode(content);
  }

  /** Create a {@link Zencode} instance from the contract name without extension
   * from the given base directory
   * @param {string} name
   * @param {string} basedir
   * @returns {Zencode}
   */
  static byName(name, basedir) {
    return Zencode.fromPath(`${basedir}/${name}.zen`);
  }
}
