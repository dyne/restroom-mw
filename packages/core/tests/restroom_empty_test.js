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
  return { body: {} };
};

test.beforeEach((t) => {
  t.context.req = mockRequest();
  t.context.res = mockResponse();
  t.context.rr = new Restroom(t.context.req, t.context.res);
});

test("Restroom instance is correctly created", (t) => {
  t.true(t.context.rr instanceof Restroom);
});

