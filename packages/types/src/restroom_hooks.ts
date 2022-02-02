import { Zencode } from "@restroom-mw/zencode";
import { Response } from "express";
import { ObjectLiteral } from "./interfaces";

export type RestroomResult = {
  result?: unknown;
  status?: number;
  error?: Error;
  errorMessage?: string;
};

export type InitHooksParams = {
  zencode: Zencode;
  conf?: string;
  data?: string;
  keys?: string;
}

export type SuccessHooksParams = {
  result: string;
  zencode: Zencode;
  zenroom_errors: string;
  outcome: RestroomResult;
}

export type AfterHooksParams = {
  json?: ObjectLiteral;
  zencode: Zencode;
  outcome: RestroomResult;
}

export type ErrorHooksParams = {
  zenroom_errors: string;
  zencode: Zencode;
  outcome: RestroomResult;
}

export type ExceptionHooksParams = {
  res: Response;
}
export type FinishHooksParams = {
  res: Response;
  outcome: RestroomResult;
}

export type HooksParams = void
  | InitHooksParams
  | SuccessHooksParams
  | AfterHooksParams
  | ErrorHooksParams
  | ExceptionHooksParams
  | FinishHooksParams;

