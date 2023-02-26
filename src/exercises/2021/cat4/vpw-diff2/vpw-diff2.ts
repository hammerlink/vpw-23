import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {forEach} from 'lodash';

interface LinePiece {
    lineIndex: number;
    value: string;
}
interface LineMap {
    [lineIndex: number]: {
        values: string[];
    }
}

function parseLine(line: string, previousIndex: number | undefined, maxLineIndex: number) {
    let parsed = line.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/, ' ');
    const getDigitMatch = parsed.match(/^([0-9]+)\s/);
    if (getDigitMatch === null) return null;
    const lineIndex = parseInt(getDigitMatch[1]);
    if (lineIndex < 1 || lineIndex > maxLineIndex) return null;
    if (previousIndex !== undefined && lineIndex < previousIndex) return null;
    const remaining = parsed.replace(/^([0-9]+)\s/, '').replace(/\s/g, '');
    return {lineIndex, value: remaining};
}

function comparePieces(left: LineMap, right: LineMap) {
    const leftLines = Object.keys(left);
    const rightLines = Object.keys(right);
    const matches = leftLines.filter(x => rightLines.includes(x));
    const total = Math.max(leftLines.length, rightLines.length);
    let matchCount = 0;
    matches.forEach(lineIndex => {
        const leftValues = left[lineIndex as any].values.sort();
        const rightValues = right[lineIndex as any].values.sort();
        if (leftValues.length !== rightValues.length) return;
        for (let i = 0; i < leftValues.length; i++) {
            if (leftValues[i] !== rightValues[i]) return;
        }
        matchCount++;
    });
    return {matchCount, total: leftLines.length};
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let leftCount: number | undefined;
    let leftIndex = 0;
    let leftLineIndex: number | undefined;
    const leftPieces: LineMap = {};
    let rightCount: number | undefined;
    let rightIndex = 0;
    let rightLineIndex: number | undefined;
    const rightPieces: LineMap = {};

    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (leftCount === undefined) {
            leftCount = parseInt(line);
            if (leftCount > 0) return;
        }
        if (leftCount > 0  && leftIndex < leftCount) {
            const parsed = parseLine(line, leftLineIndex, leftCount);
            if (parsed !== null) {
                leftLineIndex = parsed.lineIndex;
                if (!leftPieces[leftLineIndex]) leftPieces[leftLineIndex] = {values: []};
                const value = parsed.value;
                leftPieces[leftLineIndex].values.push(value);
            }

            leftIndex++;
            return;
        }
        if (rightCount === undefined) {
            rightCount = parseInt(line);
            if (rightCount > 0) return;
        }

        if (rightCount > 0 ) {
            const parsed = parseLine(line, rightLineIndex, leftLineIndex as number);
            if (parsed !== null) {
                rightLineIndex = parsed.lineIndex;
                if (!rightPieces[rightLineIndex]) rightPieces[rightLineIndex] = {values: []};
                const value = parsed.value;
                rightPieces[rightLineIndex].values.push(value);
            }
            rightIndex++;
            if (rightIndex < rightCount) return;
        }

        const compareMatches = comparePieces(leftPieces, rightPieces);

        logger(`${testNumber} ${compareMatches.matchCount}/${compareMatches.total}`)
        // handle diff
        finished = true;
    };

    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const vpwDiffHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
