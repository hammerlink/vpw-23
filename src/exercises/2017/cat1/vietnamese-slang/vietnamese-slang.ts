import { dirname, join } from 'path';
import { readInputByTestCase, TestCaseHandler } from '../../../../engine/input.engine';
import { lineToNumbers } from '../../../../engine/line-input.engine';
import assert from 'assert';

interface SnakeAttempt {
    parameterIndex: number;
    usedValueIndices: number[];
    parameters: string[];
    currentSnake: string;
    assignedParameters: {
        [parameter: string]: number;
    };
}
export function trySlang(slang: string, expectedResult: number): boolean {
    try {
        const result: number = eval(slang);
        return result === expectedResult;
    } catch (e) {
        return false;
    }
}

export function getParametersFromRawSnake(snake: string): string[] {
    return snake.match(/([A-I]+)/g).sort();
}

function findAll(
    logger: (line: string) => void,
    expectedResult: number,
    snake: string,
    parameters: string[],
    values: number[],
    testNumber: number,
) {
    assert.equal(parameters.length, values.length, `not matching parameters sizes`);
    buildSnake(
        logger,
        expectedResult,
        {
            parameterIndex: 0,
            usedValueIndices: [],
            parameters,
            currentSnake: `${snake}`,
            assignedParameters: {},
        },
        values,
        testNumber,
    );
}

function printSnakeAttempt(logger: (line: string) => void, attempt: SnakeAttempt, testNumber: number) {
    let line = `${testNumber}`;
    Object.keys(attempt.assignedParameters).forEach(
        parameter => (line += ` ${parameter}=${attempt.assignedParameters[parameter]}`),
    );
    logger(line);
}

function buildSnake(
    logger: (line: string) => void,
    expectedResult: number,
    attempt: SnakeAttempt,
    values: number[],
    testNumber: number,
) {
    const { usedValueIndices, currentSnake, parameterIndex, parameters } = attempt;
    if (parameterIndex > parameters.length - 1) {
        if (trySlang(currentSnake, expectedResult)) printSnakeAttempt(logger, attempt, testNumber);
        return;
    }
    const parameter = parameters[parameterIndex];
    for (let i = 0; i < values.length; i++) {
        if (usedValueIndices.includes(i)) continue;
        usedValueIndices.push(i);
        attempt.currentSnake = currentSnake.replace(parameter, `${values[i]}`);
        attempt.parameterIndex = parameterIndex + 1;
        attempt.assignedParameters[parameter] = values[i];

        buildSnake(logger, expectedResult, attempt, values, testNumber);

        // reset values
        attempt.currentSnake = currentSnake;
        usedValueIndices.pop();
        attempt.parameterIndex = parameterIndex;
        delete attempt.assignedParameters[parameter];
    }
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let values: number[] | null = null;
    let snake: string | null = null;
    let executionPieces: string[] | null = null;
    let expectedResult: number | undefined;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (values === null) {
            values = lineToNumbers(line);
            return;
        }
        snake = line.replace(/=.*$/, '').replace(/:/g, '/');
        executionPieces = line.split(' ');
        assert.equal(executionPieces[executionPieces.length - 2], '=');
        expectedResult = parseInt(executionPieces[executionPieces.length - 1], 10);
        const params = getParametersFromRawSnake(snake);
        findAll(logger, expectedResult, snake, params, values, testNumber);
        finished = true;
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
export const vietnameseSlangHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
