export const hook = {
  INIT: "onInit",
  BEFORE: "onBefore",
  AFTER: "onAfter",
  SUCCESS: "onSuccess",
  ERROR: "onError",
  EXCEPTION: "onException",
  FINISH: "onFinish",
};

export const getHooks = async (
  hook: string,
  res: { locals: { [x: string]: any[] } },
  ...args: any[]
) => {
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

export const initHooks: any = () => {
  const functionHooks: { [key: string]: any } = {};
  for (const h of Object.values(hook)) {
    functionHooks[h] = (res: { locals: { [x: string]: any } }, fn: any) => {
      let locals = res.locals[h] || [];
      locals.push(fn);
      res.locals[h] = locals;
    };
  }

  return functionHooks;
};
