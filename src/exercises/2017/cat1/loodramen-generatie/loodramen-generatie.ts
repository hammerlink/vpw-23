import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '../../../../engine/input.engine';
import assert from 'assert';
import {BasicMap, MapEngine} from '../../../../engine/map.engine';

interface CrossPoint {
    y: number;
    x: number;
}

function lineToNumbers(line: string): number[] {
    return line.split(" ").map(x => parseInt(x, 10));
}

function lineToCrossPoints(line: string): CrossPoint[] {
    const numbers = lineToNumbers(line);
    assert(numbers.length > 0, `invalid line, no numbers in it: ${line}`);
    const count = numbers[0];
    assert(numbers.length === (count * 2 + 1), `not all numbers are present ${line}`);
    const output: CrossPoint[] = [];
    for (let i = 1; i < numbers.length; i += 2) output.push({y: numbers[i] - 1, x: numbers[i + 1] - 1});
    return output;
}

interface CutPosition {
    cutIndex?: number;
}

function printLoodRaamMap(map: BasicMap<CutPosition>, testNumber: number, logger: (line: string) => void) {
    for (let y = map.minY; y <= map.maxY; y++) {
        let line = `${testNumber} `;
        for (let x = map.minX; x <= map.maxX; x++) {
            const value = MapEngine.getPoint(map, x, y)?.value.cutIndex;
            line += `${value !== undefined ? '*' : '.'}`;
        }
        logger(line.replace(/\s$/, ''));
    }
}

function drawCrossPoint(map: BasicMap<CutPosition>, point: CrossPoint, cutIndex: number) {
    const cutPoint = (x: number, y: number): boolean => {
        const {value} = MapEngine.getPointOrDefault(map, x, y, {});
        if (value.cutIndex !== undefined && value.cutIndex !== cutIndex) return false;
        value.cutIndex = cutIndex;
        return true;
    }
    // check the coordinates of the point
    // start cutting from the point all the way up, all the way down, left, right

    for (let x = point.x; x <= map.maxX; x++) if (!cutPoint(x, point.y)) break; // cut right
    for (let x = point.x; x >= map.minX; x--) if (!cutPoint(x, point.y)) break; // cut left
    for (let y = point.y; y <= map.maxY; y++) if (!cutPoint(point.x, y)) break; // cut down
    for (let y = point.y; y >= map.minY; y--) if (!cutPoint(point.x, y)) break; // cut up
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let hasBoundaries = false;
    const map: BasicMap<CutPosition> = MapEngine.newMap<CutPosition>();
    let crossPoints: CrossPoint[] | null = null;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (!hasBoundaries) {
            const values = lineToNumbers(line);
            assert(values.length === 2, `first line is not correct, ${line}`);
            map.maxX = values[1] - 1;
            map.maxY = values[0] - 1;
            return hasBoundaries = true;
        }
        crossPoints = lineToCrossPoints(line);
        crossPoints.forEach((crossPoint, cutIndex) => drawCrossPoint(map, crossPoint, cutIndex));
        printLoodRaamMap(map, testNumber, logger);
        finished = true;
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const loodramenGeneratieHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
