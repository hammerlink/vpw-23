import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {LineHandler, VPWTestHandler} from '@engine/test.engine';

const handler = (testNumber: number): TestCaseHandler => {
    const vpwHandler = new VPWTestHandler();

    let min: number | undefined;
    let max: number | undefined;
    const numberHandler = new LineHandler((line: string) => {
        const value = parseInt(line);
        if (min === undefined || value < min) min = value;
        if (max === undefined || value > max) max = value;
    });

    vpwHandler.handlers.push(new LineHandler((line: string) => {
        numberHandler.amount = parseInt(line);
    }, 1));
    vpwHandler.handlers.push(numberHandler);

    vpwHandler.resultHandler = new LineHandler((line: string, logger: (line: string) => void) => {
        logger(`${testNumber} ${min} ${max}`);
    });
    return vpwHandler;
};
export default handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
