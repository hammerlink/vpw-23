import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';

interface Tank {
    id: number;
}

function estimateProduction(tanks: Tank[]): number {
    let n = tanks.length;
    let m = tanks.reduce((t, v) => v.id > t ? v.id : t, 0);
    return Math.round(((n + 1) * m) / n - 1);
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const tanks: Tank[] = [];
    const lineHandler = (line: string, logger: (line: string) => void) => {
        const value = parseInt(line, 10);

        if (value < 0) {
            finished = true;
            logger(`${testNumber} ${estimateProduction(tanks)}`);
        } else tanks.push({
            id: value,
        });
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const duitseTanksHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
