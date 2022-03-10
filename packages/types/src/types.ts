import { ObjectLiteral } from "./interfaces";

export type DK = string | object | null | undefined;

export type BlockContext = {
  keys: string;
  data: any;
  next: string;
  conf: string;
  output: ObjectLiteral;
};
