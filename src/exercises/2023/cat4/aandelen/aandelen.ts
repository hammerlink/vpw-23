import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {LineHandler, VPWTestHandler} from '@engine/test.engine';
import {lineToNumbers} from '@engine/line-input.engine';

interface AandeelMoment {
    buy: number;
    sell: number;
}

const handler = (testNumber: number): TestCaseHandler => {
    const vpwHandler = new VPWTestHandler();

    let budget: number | undefined;
    let priceMoments: number[] = [];


    vpwHandler.handlers.push(new LineHandler((line: string) => {
        budget = parseInt(line);
    }, 1));
    vpwHandler.handlers.push(new LineHandler((line: string) => {
    }, 1));
    vpwHandler.handlers.push(new LineHandler((line: string) => {
        priceMoments = lineToNumbers(line);
    }, 1) );

    vpwHandler.resultHandler = new LineHandler((line: string, logger: (line: string) => void) => {
        logger(`${testNumber} ${budget}`);
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
