const fs = require('fs');
export async function readInputRaw(filePath?: string): Promise<string[]> {
  if (filePath !== undefined && fs.existsSync(filePath)) {
    return fs.readFileSync(filePath).toString().split("\n");
  }
  return new Promise((res) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    const lines: string[] = [];
    rl.on("line", (line: string) => lines.push(line));
    rl.once("close", () => res(lines));
  });
}

export interface TestCaseHandler {
  lineHandler: (line: string) => void;
  isDone: () => boolean;
}

export async function readInputByTestCase(testCaseInitiator: (testNumber: number) => TestCaseHandler, filePath?: string) {
  const lines = await readInputRaw(filePath);
  const testCases = parseInt(lines[0]);
  let testCaseCounter = 1;
  let handler: TestCaseHandler = testCaseInitiator(testCaseCounter);
  for (let i = 1; i < lines.length; i++) {
    handler.lineHandler(lines[i]);
    if (handler.isDone()) {
      testCaseCounter++;
      handler = testCaseInitiator(testCaseCounter);
      if (testCases < testCaseCounter) return;
    }
  }
}
