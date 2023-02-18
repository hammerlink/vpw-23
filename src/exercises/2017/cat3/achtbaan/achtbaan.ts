import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import assert from 'assert';
import {BasicMap, MapEngine, MapLocation} from '@engine/map.engine';

interface Cell {
    // segments: string[];
    segmentDimension: { [z: number]: string };
}

enum Orientation {
    East = 0,
    South = 1,
    West = 2,
    North = 3,
}

function turnRight(orientation: Orientation): Orientation {
    return (orientation + 1 + 4) % 4;
}

function turnLeft(orientation: Orientation): Orientation {
    return (orientation - 1 + 4) % 4;
}

function getNavOrDefault(orientation: Orientation): (map: BasicMap<Cell>, {
    x,
    y
}: MapLocation<Cell>, defaultValue: Cell, amount?: number) => MapLocation<Cell> {
    switch (orientation) {
        case Orientation.East:
            return MapEngine.navRightOrDefault;
        case Orientation.South:
            return MapEngine.navDownOrDefault;
        case Orientation.West:
            return MapEngine.navLeftOrDefault;
        case Orientation.North:
            return MapEngine.navUpOrDefault;
    }
    throw new Error('invalid orientation');
}

interface NavigationState {
    cell: MapLocation<Cell>;
    turnCell?: MapLocation<Cell>;
    orientation: Orientation;
    currentZ: number;
}

function executeCommand(map: BasicMap<Cell>, state: NavigationState, command: string): NavigationState {
    const {cell, orientation, turnCell, currentZ} = state;
    if (command === 'S') {
        cell.value.segmentDimension[currentZ] = '=';
        return {
            cell: MapEngine.navRightOrDefault(map, cell, {segmentDimension: {}}),
            orientation,
            currentZ
        };
    }
    if (command === 'V') {
        cell.value.segmentDimension[currentZ] = '_';
        let nextCell = turnCell ?? cell;
        if (orientation === Orientation.East) nextCell = MapEngine.navRightOrDefault(map, cell, {segmentDimension: {}});
        if (orientation === Orientation.West) nextCell = MapEngine.navLeftOrDefault(map, cell, {segmentDimension: {}});
        let nextZ = currentZ;
        if (orientation === Orientation.North) nextZ -= 1;
        if (orientation === Orientation.South) nextZ += 1;
        return {cell: nextCell, orientation, currentZ: nextZ};
    }
    if (command === 'L') {
        const baseCell = turnCell ?? cell;
        const newOrientation = turnLeft(orientation);
        baseCell.value.segmentDimension[currentZ] = '_';
        let newZ = currentZ;
        let nextCell = baseCell;
        if (newOrientation === Orientation.North) newZ += 1;
        else if (newOrientation === Orientation.South) newZ -= 1;
        else {
            nextCell = getNavOrDefault(newOrientation)(map, baseCell, {segmentDimension: {}});
        }
        return {
            cell: nextCell,
            orientation: newOrientation,
            turnCell: baseCell,
            currentZ: newZ
        };
    }
    if (command === 'R') {
        const baseCell = turnCell ?? cell;
        baseCell.value.segmentDimension[currentZ] = '_';
        const newOrientation = turnRight(orientation);
        let newZ = currentZ;
        let nextCell = baseCell;
        if (newOrientation === Orientation.North) newZ -= 1;
        else if (newOrientation === Orientation.South) newZ += 1;
        else nextCell = getNavOrDefault(orientation)(map, baseCell, {segmentDimension: {}});
        return {
            cell: nextCell,
            orientation: newOrientation,
            turnCell: baseCell,
            currentZ: newZ
        };
    }
    if (command === 'U') {
        let segment = '#';
        if (orientation === Orientation.East) segment = '/';
        else if (orientation === Orientation.West) segment = '\\';
        cell.value.segmentDimension[currentZ] = segment;
        const movementDir = {x: 0, y: -1, z: 0};
        if (orientation === Orientation.East) {
            movementDir.x = 1;
        } else if (orientation === Orientation.West) {
            movementDir.x = -1;
        } else if (orientation === Orientation.South) {
            movementDir.z = 1;
        } else if (orientation === Orientation.North) {
            movementDir.z = -1;
        }
        const nextCell = MapEngine.navOrDefault(map, cell, {segmentDimension: {}}, movementDir.x, movementDir.y);
        return {cell: nextCell, orientation, currentZ: currentZ + movementDir.z};
    }
    if (command === 'D') {
        let segment = '#';
        if (orientation === Orientation.East) segment = '\\';
        else if (orientation === Orientation.West) segment = '/';
        // needs to be drawn one cell lower
        const drawCell = MapEngine.navOrDefault(map, cell, {segmentDimension: {}}, 0, 1);
        drawCell.value.segmentDimension[currentZ] = segment;
        const movementDir = {x: 0, y: 1, z: 0};
        if (orientation === Orientation.East) {
            movementDir.x = 1;
        } else if (orientation === Orientation.West) {
            movementDir.x = -1;
        } else if (orientation === Orientation.South) {
            movementDir.z = 1;
        } else if (orientation === Orientation.North) {
            movementDir.z = -1;
        }
        const nextCell = MapEngine.navOrDefault(map, cell, {segmentDimension: {}}, movementDir.x, movementDir.y);
        return {cell: nextCell, orientation, currentZ: currentZ + movementDir.z};
    }
    return state;
}

function printMap(map: BasicMap<Cell>, testNumber: number, logger: (line: string) => void) {
    const {minY, minX, maxX, maxY} = map;
    for (let y = minY; y <= maxY; y++) {
        let outputLine = `${testNumber} `;
        let isValid = false;
        for (let x = minX; x <= maxX; x++) {
            const point = MapEngine.getPoint(map, x, y);
            let value = '.';
            if (point) {
                const zValues = Object.keys(point.value.segmentDimension).sort();
                if (zValues.length) {
                    isValid = true;
                    value = point?.value.segmentDimension[zValues[0] as any];
                }
            }
            outputLine += value;
        }
        if (isValid) logger(outputLine);
    }
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        let parts = line.split(' ');
        assert(parts.length === 2);
        const map = MapEngine.newMap<Cell>();
        const commands = parts[1].split('');
        let state: NavigationState = {
            cell: MapEngine.getPointOrDefault(map, 0, 0, {segmentDimension: {}}),
            orientation: Orientation.East,
            currentZ: 0,
        }
        commands.forEach(c => {
            state = executeCommand(map, state, c);
            printMap(map, testNumber, logger);
            console.log();
        });

        printMap(map, testNumber, logger);
        finished = true;
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const achtbaanHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}

