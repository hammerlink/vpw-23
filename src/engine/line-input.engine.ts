export function lineToNumbers(line: string): number[] {
    return line.split(" ").map(x => parseInt(x, 10));
}
