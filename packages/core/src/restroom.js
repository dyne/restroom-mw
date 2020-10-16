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
  constructor(req, res) {
    this._req = req;
    this._res = res;
  }

  /**
   * Save a key value, accessible afterwards into the contracts DATA field
   *
   * @param {string} k
   * @param {object} v
   */
  setData(k, v) {
    let data = this._res.locals.zenroom_data || this._req.body.data || {};
    data[k] = v;
    this._res.locals.zenroom_data = data;
  }

  /**
   * Get the value by key from the DATA field
   *
   * @param {string} k
   */
  getData(k) {
    return this._res.locals.zenroom_data[k];
  }

  _hook(name, promise) {
    let locals = this._res.locals[name] || [];
    locals.push(promise);
    this._res.locals[name] = locals;
  }

  /**
   * Saves the promise to be executed at the onInit lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onInit(promise) {
    this._hook("onInit", promise);
  }

  /**
   * Saves the promise to be executed at the onBefore lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onBefore(promise) {
    this._hook("onBefore", promise);
  }

  /**
   * Saves the promise to be executed at the onSuccess lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onSuccess(promise) {
    this._hook("onSuccess", promise);
  }

  /**
   * Saves the promise to be executed at the onAfter lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onAfter(promise) {
    this._hook("onAfter", promise);
  }

  /**
   * Saves the promise to be executed at the onError lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onError(promise) {
    this._hook("onError", promise);
  }

  /**
   * Saves the promise to be executed at the onException lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onException(promise) {
    this._hook("onException", promise);
  }

  /**
   * Saves the promise to be executed at the onFinish lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Promise} promise
   */
  onFinish(promise) {
    this._hook("onFinish", promise);
  }
}
