import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '../../../../engine/input.engine';

function lineContainsSequentialNumbers(line: string, decimalNumberCount: number, testNumber: number): number | -1 | null {
    if (decimalNumberCount >= line.length) return -1;

    let hasMissingNumber = false;
    let missingNumber: number | undefined;
    let currentNumber = parseInt(line.substring(0, decimalNumberCount), 10);
    let remainingLine = line.substring(`${currentNumber}`.length);

    while (remainingLine.length) {
        let nextNumber = currentNumber + 1;
        if (remainingLine.startsWith(`${nextNumber}`)) {
            remainingLine = remainingLine.substring(`${nextNumber}`.length);
            currentNumber = nextNumber;
            continue;
        }
        if (!hasMissingNumber && remainingLine.startsWith(`${currentNumber + 2}`)) {
            missingNumber = currentNumber + 1;
            currentNumber = currentNumber + 2;
            remainingLine = remainingLine.substring(`${currentNumber}`.length);
            hasMissingNumber = true;
            continue;
        }
        return null;
    }
    return missingNumber ?? -1;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        finished = true;
        let decimalNumberCount = 1;
        let result: number | null = null;
        do {
            result = lineContainsSequentialNumbers(line, decimalNumberCount, testNumber);
            decimalNumberCount++;
        }
        while (result === null);
        logger(`${testNumber} ${result === -1 ? 'geen ontbrekend getal' : result}`);
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const ontbrekendGetalHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
