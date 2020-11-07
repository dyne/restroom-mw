import test from "ava";
import { Restroom } from "../dist/restroom";
import * as sinon from "sinon";

const mockResponse = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  res.locals = {};
  return res;
};

const mockRequest = () => {
  return {
    body: {
      data: {},
    },
  };
};

test.beforeEach((t) => {
  t.context.req = mockRequest();
  t.context.res = mockResponse();
  t.context.rr = new Restroom(t.context.req, t.context.res);
});

test("Restroom instance is correctly created", (t) => {
  t.true(t.context.rr instanceof Restroom);
});

test("Restroom hooks correctly works", (t) => {
  const p = new Promise(
    () => {},
    () => {}
  );
  const p2 = new Promise(
    () => {},
    () => {}
  );
  t.context.rr.onInit(p);
  t.context.rr.onInit(p2);
  t.context.rr.onBefore(p);
  t.context.rr.onSuccess(p);
  t.context.rr.onAfter(p);
  t.context.rr.onError(p);
  t.context.rr.onException(p);
  t.context.rr.onFinish(p);
  t.deepEqual(t.context.res.locals.onInit, [p, p2]);
  t.deepEqual(t.context.res.locals.onBefore, [p]);
  t.deepEqual(t.context.res.locals.onSuccess, [p]);
  t.deepEqual(t.context.res.locals.onAfter, [p]);
  t.deepEqual(t.context.res.locals.onError, [p]);
  t.deepEqual(t.context.res.locals.onException, [p]);
  t.deepEqual(t.context.res.locals.onFinish, [p]);
});
