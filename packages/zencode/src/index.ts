import fs from "fs";

// from https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/chunk.md
export const chunk = <T> (arr: Array<T>, size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

interface DescriptionParser {
  (words: string[]): string;
}

const quoted = new RegExp(/'[^']*'/, "g");

const getParams = (sentence: string) => {
  const params = sentence.match(quoted);
  return params ? params.map((p) => p.replace(/'/g, "")) : null;
  /* TODO: allow chunking of params for multiline and better parsing
  const cleaned = params ? params.map((p) => p.replace(/'/g, "")) : null;

  if (cleaned && Array.isArray(cleaned)) {
    return cleaned.length > 1 ? [cleaned] : cleaned;
  }
  return null;
  */
};

const removeParams = (sentence: string) => sentence.replace(quoted, "{}");

const removeKeywords = (sentence: string) => {
  const words = ["when", "given", "and", "then"];
  const w = sentence.trim().split(" ");
  if (words.includes(w[0].toLowerCase())) w.shift();
  return w.join(" ");
};

const removeSuperfluousWords = (str: string) => {
  str = ["I ", "that ", "valid ", "known as ", "all "].reduce(
    (result: string, w: string) => result.split(w).join(""),
    str
  );

  return [
    [" inside ", " in "],
    [" an ", " a "],
  ].reduce((result, [s, j]) => result.split(s).join(j), str);
};

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
  _content: string;

  constructor(content: string) {
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
    const re = /^scenario/i;
    for (const line of this.content.split("\n")) {
      if (re.test(line.trim())) {
        return line.trim();
      }
    }
    return null;
  }

  __parseDescription(fn: DescriptionParser) {
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
   * keywords are stripped away and all arguments (whatever is
   * inside a single quote) are replaced with `{}`.
   * All the transformation are case insensitive.
   *
   * List of keywords (removed if the first word of a sentence):
   *   * `when`
   *   * `given`
   *   * `and`
   *   * `then`
   *
   * List of ignored words (each occurence is removed):
   *   * `I `
   *   * `that `
   *   * `valid `
   *   * `known as `
   *   * `all `
   *
   * Also these are aliased:
   *  * `inside` → `in`
   *  * `an` → `a`
   *
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
   * //   'create the array of {} random objects of {} bits' => [ '16', '32' ],
   * //   'print all data' => [],
   * //   '' => []
   * // }
   *
   * @returns {Map<String, Array<string>>}
   */
  parse() {
    const parsed = new Map();
    for (const line of this.content.split("\n")) {
      let params = [];
      const lid = removeSuperfluousWords(
        removeKeywords(removeParams(line))
      ).trim();
      // duplicate sentences
      if (parsed.has(lid)) {
        params = parsed.get(lid);
      }
      params.push(...(getParams(line) ?? []));
      parsed.set(lid, params);
    }
    return parsed;
  }

  /**
   * Test existence of a sentenceId within the contract
   * @param {string} sentenceId
   * @returns {boolean}
   */
  match(sentenceId: string) {
    return [...this.parse().keys()].includes(sentenceId);
  }

  /**
   * Return the parameters for a given sentenceId
   * @param {string} sentenceId
   * @returns {Array<string>}
   */
  paramsOf(sentenceId: string) {
    return this.parse().get(sentenceId);
  }

  /**
   * Return the parameters for a given sentenceId chunked in group
   * of given size
   * @param {string} sentenceId
   * @param {number} chunkSize
   * @returns {Array<Array<string>>}
   */
  chunkedParamsOf(sentenceId: string, chunkSize: number) {
    const params = this.paramsOf(sentenceId);
    if(params.length % chunkSize != 0)
      throw new Error("Wrong number of arguments")
    return chunk(params, chunkSize);
  }
  /**
   * Create a {@link Zencode} instance from the full path of the contract
   * @param {string} path
   * @returns {Zencode}
   */
  static fromPath(path: string) {
    const content = fs.readFileSync(path).toString();
    return new Zencode(content);
  }

  /** Create a {@link Zencode} instance from the contract name without extension
   * from the given base directory
   * @param {string} name
   * @param {string} basedir
   * @returns {Zencode}
   */
  static byName(name: string, basedir: string) {
    return Zencode.fromPath(`${basedir}/${name}.zen`);
  }
}
