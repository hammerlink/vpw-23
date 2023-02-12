import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '../engine/input.engine';

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const lineHandler = (line: string, logger: (line: string) => void) => {

    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
