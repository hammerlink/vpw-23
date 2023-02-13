import { dirname, join } from 'path';
import { readInputByTestCase, TestCaseHandler } from '@engine/input.engine';

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let numberCount: number | null = null;
    let index = 0;
    let min: number | null = null;
    let max: number | null = null;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        const value = parseInt(line, 10);
        if (numberCount === null) {
            numberCount = value;
            return;
        }
        if (min === null || value < min) min = value;
        if (max === null || value > max) max = value;

        index++;
        if (index >= numberCount) {
            logger(`${testNumber} ${min} ${max}`);
            finished = true;
        }
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
export const minMaxHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
