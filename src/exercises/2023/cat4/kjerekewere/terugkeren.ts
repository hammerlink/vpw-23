import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {LineHandler, VPWTestHandler} from '@engine/test.engine';
import {BasicMap, MapEngine, MapLocation} from '@engine/map.engine';

enum Orientation {
    East = 0,
    South = 1,
    West = 2,
    North = 3,
}

const mapDirection: { [direction: string]: { x: number, y: number } } = {
    'O': {x: 1, y: 0},
    'Z': {x: 0, y: 1},
    W: {x: -1, y: 0},
    N: {x: 0, y: -1},
}

interface Cell {

    visitedPoints: MapLocation<Cell>[];
    distance: number;
    returnVisited?: boolean;
}

interface Command {
    amount: number;
    orientation: Orientation;
}

function getDistanceToOrigin(x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
}

interface TerugKeerMap extends BasicMap<Cell> {
    position: MapLocation<Cell>;
}

let globalBest: number | undefined;


function getNextOptions(map: TerugKeerMap): MapLocation<Cell>[] {

   const options = map.position.value.visitedPoints
       .filter(x => x !== null && x.value.returnVisited !== true) as MapLocation<Cell>[];
   options.sort((a, b) => (a?.value.distance ?? 0) - (b?.value.distance ?? 0));
   return options;
}

function calculateBestReturn(map: TerugKeerMap, steps: number) {
    if (map.position.x === 0 && map.position.y === 0) {
        if (globalBest === undefined || steps < globalBest) {
            globalBest = steps;
        }
        return;
    }
    if (globalBest !== undefined && steps + map.position.value.distance < globalBest) return;
    let hasMoved = false;
    const start = map.position;
    start.value.returnVisited = true;
    const movedPieces: MapLocation<Cell>[] = [];
    let currentSteps = 1;
    const cleanup = () => {
        movedPieces.forEach(x => x.value.returnVisited = false);
        map.position = start;
    };
    do {
        const nextOptions = getNextOptions(map);
        if (nextOptions.filter(x => x.x === 0 && x.y === 0).length) {
            if (globalBest === undefined || steps + currentSteps < globalBest) globalBest = steps + currentSteps;
            return cleanup();
        }
        if (nextOptions.length === 1) {
            map.position.value.returnVisited = true;
            movedPieces.push(map.position);
            map.position = nextOptions[0];
            hasMoved = true;
            currentSteps++;
            // printMap(map); // TODO
        }
        if (nextOptions.length === 0) return cleanup();
        if (nextOptions.length > 1) {
            map.position.value.returnVisited = true;
            for (let i = 0; i < nextOptions.length; i++) {
                nextOptions[i].value.returnVisited = true;
                map.position = nextOptions[i];
                calculateBestReturn(map, steps + currentSteps);
                cleanup();
            }
            map.position.value.returnVisited = false;
            return;
        }

    } while (hasMoved);
   cleanup();
}

function printMap(map: TerugKeerMap) {
    console.log();
    MapEngine.printMap(map, (value) => {
        if (value === map.position) return 'O';
        return value?.value.visitedPoints.length ? 'X' : ' ';
    }, false);
}

const handler = (testNumber: number): TestCaseHandler => {
        const vpwHandler = new VPWTestHandler();
        const rawMap: BasicMap<Cell> = MapEngine.newMap();
        const map: TerugKeerMap = {
            ...rawMap,
            position: MapEngine.getPointOrDefault(rawMap, 0, 0, {visitedPoints: [], distance: 0}),
        };
        map.position = MapEngine.getPointOrDefault(map, 0, 0, {visitedPoints: [], distance: getDistanceToOrigin(0, 0)});

        vpwHandler.handlers.push(new LineHandler((line: string) => {
                const commands = line.match(/(\d+) ([NOWZ])/g)
                    ?.forEach(part => {
                        const pieces = part.split(' ');

                        if (map.position.x === 9 && map.position.y === -5) {
                            const x= null;
                        }
                        const amount = parseInt(pieces[0]);
                        const {x, y} = mapDirection[pieces[1]];
                        for (let i = 0; i < amount; i++) {
                            const previous = map.position;
                            const nextX = map.position.x + x;
                            const nextY = map.position.y + y;
                            map.position = MapEngine.getPointOrDefault(map, nextX, nextY, {
                                visitedPoints: [],
                                distance: getDistanceToOrigin(nextX, nextY)
                            });
                            if (map.position.x === 9 && map.position.y === -5) {
                                const x= null;
                            }
                            if (!previous.value.visitedPoints.includes(map.position)) previous.value.visitedPoints.push(map.position);
                            if (!map.position.value.visitedPoints.includes(previous)) map.position.value.visitedPoints.push(previous);
                        }
                    });

                // console.log(`${testNumber}`)
                if (false ) MapEngine.printMap(map, (value) => value?.value.visitedPoints.length ? 'X' : ' ', false);
            }, 1
        ));


        vpwHandler.resultHandler = new LineHandler((line: string, logger: (line: string) => void) => {
            globalBest = undefined;
            // if (testNumber === 13)MapEngine.printMap(map, (value) => {
            //     if (value === map.position) return 'O';
            //     return value?.value.visitedPoints.length ? 'X' : ' ';
            // }, false);
            calculateBestReturn(map, 0);
            logger(`${testNumber} ${globalBest}`);
        });
        return vpwHandler;
    }
;
export default handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
