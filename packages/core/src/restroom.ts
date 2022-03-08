import { ObjectLiteral } from "@restroom-mw/types";
import { DK } from "./types";

/**
 *
 * @author Puria Nafisi Azizi <puria@dyne.org> @pna
 * @copyright 2020 Dyne.org
 * @license AGPL-3.0-only
 *
 * Main class that will allow to define promise hooks and
 * save `data` between different middlewares
 *
 * @param {object} req express req object
 * @param {object} res express res object
 */
export class Restroom {
  _req: any;
  _res: any;
  constructor(req: any, res: any) {
    this._req = req;
    this._res = res;
  }

  _hook(name: string, promise: (params: Promise<void>) => Promise<void>) {
    let locals = this._res.locals[name] || [];
    locals.push(promise);
    this._res.locals[name] = locals;
  }

  /**
   * Saves the promise to be executed at the onInit lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onInit(promise: (params: any) => Promise<void>) {
    this._hook("onInit", promise);
  }

  /**
   * Saves the promise to be executed at the onBefore lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onBefore(promise: (params: any) => Promise<void>) {
    this._hook("onBefore", promise);
  }

  /**
   * Saves the promise to be executed at the onSuccess lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onSuccess(promise: (params: any) => Promise<void>) {
    this._hook("onSuccess", promise);
  }

  /**
   * Saves the promise to be executed at the onAfter lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onAfter(promise: (params: any) => Promise<void>) {
    this._hook("onAfter", promise);
  }

  /**
   * Saves the promise to be executed at the onError lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onError(promise: (params: any) => Promise<void>) {
    this._hook("onError", promise);
  }

  /**
   * Saves the promise to be executed at the onException lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onException(promise: (params: any) => Promise<void>) {
    this._hook("onException", promise);
  }

  /**
   * Saves the promise to be executed at the onFinish lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onFinish(promise: (params: any) => Promise<void>) {
    this._hook("onFinish", promise);
  }

  /**
   * Parse the potential JSON in a safe manner and return it as an object
   * @param {string} keys
   * @param {string?} errorMessage
   * @returns {object}
   * @throws {Error}
   * @example
   * ```
   * const keys = req.body.keys;
   * const data = await restroom.(keys);
   * ```
   */
  safeJSONParse(o: DK, errorMessage?: string): object {
    const notNull = o ?? {};
    if (typeof notNull === "object") return notNull;
    try {
      return JSON.parse(notNull);
    } catch (err) {
      throw new Error(errorMessage ?? err)
    }
  }

  /**
   * Combine data and keys parsed as safe JSON objects into a single object
   * @param {object} data
   * @param {object} keys
   * @returns {object}
   * @example
   * ```
   * const data = req.body.data;
   * const keys = req.body.keys;
   * const dataKeys = await restroom.combineDataKeys(data, keys);
   * ```
   * @see [combineDataKeys](/architecture?id=combine-data-keys)
   */
  combineDataKeys(data: DK, keys: DK): ObjectLiteral {
    const d = this.safeJSONParse(data, "data is not a valid JSON");
    const k = this.safeJSONParse(keys, "keys is not a valid JSON");
    return { ...d, ...k };
  }
}
