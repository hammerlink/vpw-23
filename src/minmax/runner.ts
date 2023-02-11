import { parseInput } from ".";

const fs = require("fs");
const path = require("path");

const rawLines = fs
  .readFileSync(path.join(path.dirname(__filename), "example.input"))
  .toString()
  .split("\n");

rawLines.forEach((x) => console.log(x));

parseInput(rawLines);
