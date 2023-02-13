import { dirname, join } from 'path';
import { readInputByTestCase, TestCaseHandler } from '../engine/input.engine';

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        finished = true;
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
export const templateHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
