/**
 *
 * @author Puria Nafisi Azizi <puria@dyne.org> @pna
 * @copyright 2020 Dyne.org
 * @license AGPL-3.0-only
 *
 * Main class that will allow to define function hooks and
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
    let data = this._res.locals?.zenroom_data || this._req.body.data || {};
    data[k] = v;
    this._res.locals.zenroom_data = data;
  }

  /**
   * Get the value by key from the DATA field
   *
   * @param {string} k
   */
  getData(k) {
    return this._res.locals?.zenroom_data[k];
  }

  hook(name, fn) {
    let locals = this._res.locals[name] || [];
    locals.push(fn);
    this._res.locals[name] = locals;
  }

  /**
   * Saves the function to be executed at the onInit lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Function} fn
   */
  onInit(fn) {
    this.hook("onInit", fn);
  }

  /**
   * Saves the function to be executed at the onBefore lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Function} fn
   */
  onBefore(fn) {
    this.hook("onBefore", fn);
  }

  /**
   * Saves the function to be executed at the onSuccess lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Function} fn
   */
  onSuccess(fn) {
    this.hook("onSuccess", fn);
  }

  /**
   * Saves the function to be executed at the onAfter lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Function} fn
   */
  onAfter(fn) {
    this.hook("onAfter", fn);
  }

  /**
   * Saves the function to be executed at the onError lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Function} fn
   */
  onError(fn) {
    this.hook("onError", fn);
  }

  /**
   * Saves the function to be executed at the onException lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Function} fn
   */
  onException(fn) {
    this.hook("onException", fn);
  }

  /**
   * Saves the function to be executed at the onFinish lifecycle step
   * @see [lifecycle](/architecture?id=lifecycle-hooks)
   * @param {Function} fn
   */
  onFinish(fn) {
    this.hook("onFinish", fn);
  }
}
