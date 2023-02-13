import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {BasicMap, Boundaries, MapEngine, MapLocation} from '@engine/map.engine';
import {lineToNumbers} from '@engine/line-input.engine';
import assert from 'assert';

interface Cell {
    isCut: boolean;
}

function findCrossPointCell(map: BasicMap<Cell>, boundaries: Boundaries): MapLocation<Cell> | null {
    let output: MapLocation<Cell>[] = [];
    const {minY, minX, maxX, maxY} = boundaries;
    let selectedY: number | undefined;
    for (let y = minY; y <= maxY; y++) {
        const leftCell = MapEngine.getPoint(map, minX, y);
        const rightCell = MapEngine.getPoint(map, maxX, y);
        if (leftCell?.value.isCut && rightCell?.value.isCut) {
            selectedY = y;
            break;
        }
    }
    let selectedX: number | undefined;
    for (let x = minX; x <= maxX; x++) {
        const upCell = MapEngine.getPoint(map, x, minY);
        const bottomCell = MapEngine.getPoint(map, x, maxY);
        if (upCell?.value.isCut && bottomCell?.value.isCut) {
            selectedX = x;
            break;
        }
    }
    if (selectedY === undefined || selectedX === undefined) return null;
    return MapEngine.getPoint(map, selectedX, selectedY);
}

function buildCrossPoint(map: BasicMap<Cell>, boundaries: Boundaries): CrossPoint | undefined {
    const cell = findCrossPointCell(map, boundaries);
    if (cell === null) return undefined;
    return {
        cell, boundaries, sections: [
            buildCrossPoint(map, {...boundaries, maxX: cell.x - 1, maxY: cell.y - 1}), // top left
            buildCrossPoint(map, {...boundaries, minX: cell.x + 1, maxY: cell.y - 1}), // top right
            buildCrossPoint(map, {...boundaries, maxX: cell.x - 1, minY: cell.y + 1}), // bottom left
            buildCrossPoint(map, {...boundaries, minX: cell.x + 1, minY: cell.y + 1}), // bottom right
        ]
    };
}


interface CrossPoint {
    cell: MapLocation<Cell>;
    boundaries: Boundaries;
    sections: [
            CrossPoint | undefined,
            CrossPoint | undefined,
            CrossPoint | undefined,
            CrossPoint | undefined,
    ];
}

function getCrossPointDescription(crossPoint: CrossPoint | undefined): string {
    if (crossPoint === undefined) return '';
    const {cell, sections} = crossPoint;
    return `(${cell.y + 1},${cell.x + 1})${
        sections.reduce((t, crossPoint) => t +=`[${getCrossPointDescription(crossPoint)}]`, '')
    }`;
}

function buildDescription(map: BasicMap<Cell>): string {
    const rootCrossPoint = buildCrossPoint(map, MapEngine.getBoundaries(map));

    return getCrossPointDescription(rootCrossPoint);
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const map: BasicMap<Cell> = MapEngine.newMap();
    let hasBoundaries = false;
    let countY = 0;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (!hasBoundaries) {
            const numbers = lineToNumbers(line);
            assert(numbers.length === 2);
            map.maxY = numbers[0] - 1;
            map.maxX = numbers[1] - 1;
            hasBoundaries = true;
            return;
        }
        for (let x = 0; x < line.length; x++) {
            MapEngine.setPointInMap(map, x, countY, {isCut: line[x] === '*'});
        }
        countY++;
        if (countY > map.maxY) {
            logger(`${testNumber} <${map.maxY + 1},${map.maxX + 1}>${buildDescription(map)}`);
            finished = true;
        }
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const loodRamenAnalyseHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
