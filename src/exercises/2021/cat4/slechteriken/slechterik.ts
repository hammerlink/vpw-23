import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {BasicMap, MapEngine, MapLocation} from '@engine/map.engine';
import assert from 'assert';

enum SpelerType {
    good,
    bad,
    unknown,
}

interface Field extends BasicMap<Speler> {
    all: MapLocation<Speler>[];
    goods: MapLocation<Speler>[];
    bads: MapLocation<Speler>[];
}

interface Speler {
    type: SpelerType;
    id: number;
    target?: MapLocation<Speler>;
    targetedList: MapLocation<Speler>[];
}

function getCoordinates(target: number): { x: number, y: number } {
    const x = (target - 1) % 3;
    const y = Math.floor((target - 1) / 3);
    return {x, y};
}


function printMap(map: Field) {
    console.log();
    MapEngine.printMap(map, (x) => {
        if (!x) return ' ';
        const type = x.value.type;
        if (type === SpelerType.bad) return 'b';
        if (type === SpelerType.unknown) return 'u';
        return 'g';
    });
}

function setSpelerToBad(map: Field, speler: MapLocation<Speler>) {
    speler.value.type = SpelerType.bad;
    if (!map.bads.includes(speler)) map.bads.push(speler);
    const wronglyAccused = speler.value.target;
    if (wronglyAccused === undefined) return;
    const removeIndex = wronglyAccused.value.targetedList.indexOf(speler);
    wronglyAccused.value.targetedList.splice(removeIndex, 1);
}

function setSpelerToGood(map: Field, speler: MapLocation<Speler>) {
    speler.value.type = SpelerType.good;
    if (!map.goods.includes(speler)) map.goods.push(speler);
    if (speler.value.target !== undefined) setSpelerToBad(map, speler.value.target);
}

function getOutput(bad1: MapLocation<Speler>, bad2: MapLocation<Speler>): string {
    assert(bad1 !== bad2);
    const id1 = bad1.value.id;
    const id2 = bad2.value.id;
    if (id1 < id2) return `${id1},${id2}`;
    return `${id2},${id1}`;
}

function print(testNumber: number, logger: (line: string) => void, output: string) {
    logger(`${testNumber} ${output}`);
}

function checkIfResult(map: Field, testNumber: number, logger: (line: string) => void): boolean {
    if (map.bads.length === 2) {
        print(testNumber, logger, getOutput(map.bads[0], map.bads[1]));
        return true;
    }
    if (map.goods.length === 7) {
        const bads = map.all.filter(x => !map.goods.includes(x));
        print(testNumber, logger, getOutput(bads[0], bads[1]));
        return true;
    }

    return false;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const spelerMap: Field = {
        ...MapEngine.newMap(),
        all: [],
        goods: [],
        bads: [],
    };
    spelerMap.maxX = 2;
    spelerMap.maxY = 2;

    let y = 0;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        const parts = line.split(',');
        assert(parts.length === 3);
        for (let x = 0; x < parts.length; x++) {
            const part = parts[x];
            const id = y * 3 + x + 1;
            const position = MapEngine.getPointOrDefault(spelerMap, x, y, {
                type: SpelerType.unknown,
                targetedList: [],
                id
            });
            if (part.indexOf('>') > -1) {
                const targetId = parseInt(part.split('->')[1]);
                const target = getCoordinates(targetId);
                position.value.target = MapEngine.getPointOrDefault(spelerMap, target.x, target.y, {
                    type: SpelerType.unknown,
                    targetedList: [],
                    id: targetId,
                });
                position.value.target.value.targetedList.push(position);
            } else position.value.type = SpelerType.good;
        }

        y++;
        if (y <= 2) return;

        MapEngine.iterateMap(spelerMap, (speler) => {
            if (!speler) return;
            spelerMap.all.push(speler);
        });
        // minimum pointers =
        // get all without a target => auto good
        const noTargets = spelerMap.all.filter(x => x.value.target === undefined);
        noTargets.forEach(x => {
            setSpelerToGood(spelerMap, x);
            // set all adjacent to good
            MapEngine.getAdjacentPoints(spelerMap, x.x, x.y)
                .forEach(a => {
                    if (a !== null && a.value.type !== SpelerType.good) setSpelerToGood(spelerMap, a);
                });
        });

        let hasReplaced = false;
        do {
            hasReplaced = false;
            // verify all targets
            spelerMap.all
                .filter(x => x.value.target !== undefined && x.value.type === SpelerType.unknown
                    && x.value.target?.value.type === SpelerType.good)
                .forEach((x) => {
                    hasReplaced = true;
                    setSpelerToBad(spelerMap, x);
                });
            if (!hasReplaced) {
                // check goods if no bads were found
                spelerMap.all
                    .filter(x => x.value.target !== undefined && x.value.type === SpelerType.unknown
                        && x.value.target?.value.type === SpelerType.bad)
                    .forEach(x => {
                        hasReplaced = true;
                        setSpelerToGood(spelerMap, x);
                    })
            }
            if (!hasReplaced) {
                spelerMap.all.filter(x => x.value.type === SpelerType.unknown && x.value.targetedList.length === 0)
                    .forEach(x => {
                        hasReplaced = true;
                        setSpelerToGood(spelerMap, x);
                    })
            }
        } while (hasReplaced);

        if (!checkIfResult(spelerMap, testNumber, logger)) {
            printMap(spelerMap);
        }
        finished = true;
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const slechterikHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
