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
  const ll = require("lazylines");
  process.stdin.resume();
  var input = new ll.LineReadStream(process.stdin);

  const lines: string[] = [];
  input.on("line", function(line: string) { 
    lines.push(line.replace("\n", ""));
  });

  input.on("end", function() {
    // console.log("done");
    // console.log(JSON.stringify(lines, null, 4));
    parseInput(lines);
  });
}
