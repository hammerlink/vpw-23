import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {LineHandler, VPWTestHandler} from '@engine/test.engine';

export const handler = (testNumber: number): TestCaseHandler => {
    const vpwHandler = new VPWTestHandler();
    const firstLineHandler = new LineHandler((line: string) => {

    }, 1);
    vpwHandler.handlers.push(firstLineHandler);
    vpwHandler.resultHandler = new LineHandler((line: string, logger: (line: string) => void) => {
        logger(`${testNumber}`);
    });
    return vpwHandler;
};

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
