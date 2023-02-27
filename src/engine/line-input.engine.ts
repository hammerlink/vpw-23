export function lineToNumbers(line: string): number[] {
    return line.split(' ').map(x => parseInt(x, 10));
}

export function splitLineInChunks(line: string, chunkSize: number): string[] {
    const output: string[] = [];
    for (let i = 0; i < line.length; i += chunkSize) {
        output.push(line.substring(i, i + chunkSize));
    }
    return output;
}
