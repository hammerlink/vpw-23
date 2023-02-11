export const parseInput = (lines: string[]) => {
  let lineIndex = 0;
  const readNextValue = () => {
    const value = parseInt(lines[lineIndex], 10);
    lineIndex++;
    return value;
  };
  const exerciseCount = readNextValue();
  for (let i = 0; i < exerciseCount; i++) {
    const numberCount = readNextValue();
    let min: number | null = null;
    let max: number | null = null;
    for (let v = 0; v < numberCount; v++) {
      const value = readNextValue();
      if (min === null || value < min) min = value;
      if (max === null || value > max) max = value;
    }
    console.log(`${i + 1} ${min} ${max}`);
  }
};

if (require.main) {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const lines: string[] = [];
  rl.on("line", (line: string) => lines.push(line));
  rl.once("close", () => parseInput(lines));
}
