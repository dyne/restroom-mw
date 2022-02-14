import boxen from "boxen";

export function box(msg: string): void {
  console.log(boxen(msg, { padding: 1, margin: 1, borderStyle: "bold" }));
}
