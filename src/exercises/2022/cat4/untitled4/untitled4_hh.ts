import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {lineToNumbers} from '@engine/line-input.engine';

interface State {
    min?: number;
    max?: number;
}

interface Cell {
    value: number;
    calc?: number;
}

function calculateFormula(cells: Cell[], index: number, state: State): State {
    let {min, max} = state;
    const cell = cells[index];
    const {value, calc} = cell;
    if (min === undefined || max === undefined) {
        cell.calc = 0;
        return {min: value, max: value};
    }
    let outputState = {...state};
    if (value < min) {
        cell.calc = 0;
        outputState.min = value;
        return outputState;
    }
    if (value > max) {
        cell.calc = cells.length - 1 - index;
        outputState.max = value;
        return outputState;
    }
    let countSmaller = 0;
    for (let i = index + 1; i < cells.length; i++) {
        const next = cells[i];
        if (cell.value === next.value && next.calc !== undefined) {
            countSmaller += next.calc;
            break;
        } else if (cell.value > next.value) {
            countSmaller++;
        }

    }
    cell.calc = countSmaller;
    return outputState;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let arraySize: number | undefined;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (arraySize === undefined) {
            arraySize = parseInt(line, 10);
            return;
        }
        if (arraySize === 0) {
            finished = true;
            return logger(`${testNumber}`);
        }
        const values: Cell[] = lineToNumbers(line).map(x => ({value: x}));
        let state: State = {};
        for (let i = 0; i < values.length; i++) {
            state = calculateFormula(values, values.length - 1 - i, state);
        }

        let output = `${testNumber}`;
        values.forEach(x => output += ` ${x.calc}`);
        logger(output);
        finished = true;
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const untitled4Handler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
