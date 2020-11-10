export const hook = {
  INIT: "onInit",
  BEFORE: "onBefore",
  AFTER: "onAfter",
  SUCCESS: "onSuccess",
  ERROR: "onError",
  EXCEPTION: "onException",
  FINISH: "onFinish",
};

export const getHooks = async (hook, res, ...args) => {
  const hooks = res.locals[hook] || [];
  return Promise.all(
    hooks.map(async (fn) => {
      try {
        await fn(...(await args));
      } catch (e) {
        throw e;
      }
    })
  );
};

export const initHooks = () => {
  const functionHooks = {};

  for (const h of Object.values(hook)) {
    functionHooks[h] = (res, fn) => {
      let locals = res.locals[h] || [];
      locals.push(fn);
      res.locals[h] = locals;
    };
  }

  return functionHooks;
};
