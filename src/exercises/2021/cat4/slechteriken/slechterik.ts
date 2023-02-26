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

function setBadsBasedOnGood(map: Field) {
    MapEngine.iterateMap(map, (speler) => {
        if (!speler) return;
        if (speler.value.type !== SpelerType.good) return;
        if (speler.value.target === undefined) return;
        const bad = speler.value.target;
        speler.value.target.value.type = SpelerType.bad;
        speler.value.target.value.target = undefined;
        if (!map.bads.includes(bad)) map.bads.push(bad);
    })
}

function noTargettedIsGood(map: Field) {
    MapEngine.iterateMap(map, (speler) => {
        if (!speler) return;
        if (speler.value.targetedList.filter(x => x.value.type !== SpelerType.bad).length === 0) {
            speler.value.type = SpelerType.good;
            if (!map.goods.includes(speler)) map.goods.push(speler);
        }

    })
}

function setAdjacentGoodOfNoTargets(map: Field) {
    MapEngine.iterateMap(map, (speler) => {
        if (!speler) return;
        if (speler?.value?.target === undefined) {
            const adjacents = MapEngine.getAdjacentPoints(map, speler.x, speler.y);
            adjacents.forEach(x => {
                if (!x) return;
                x.value.type = SpelerType.good;
                if (!map.goods.includes(x)) map.goods.push(x);
            })
        }
    })
}

function getUnknownOrBad(map: Field): MapLocation<Speler>[] {
    const outputList: MapLocation<Speler>[] = [];
    MapEngine.iterateMap(map, (speler) => {
        if (!speler) return;
        const type = speler.value.type;
        if (type === SpelerType.bad) outputList.push(speler);
    })
    return outputList;
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
        })
        setAdjacentGoodOfNoTargets(spelerMap);
        // printMap(spelerMap);
        noTargettedIsGood(spelerMap);
        // printMap(spelerMap);
        setBadsBasedOnGood(spelerMap);
        // printMap(spelerMap);
        noTargettedIsGood(spelerMap);
        assert(spelerMap.bads.length === 2 || spelerMap.goods.length === 7);
        if (spelerMap.bads.length !== 2) {
           spelerMap.bads = spelerMap.all.filter(x => !spelerMap.goods.includes(x));
        }

        let oLine = `${testNumber} `;
        spelerMap.bads.forEach((x, i) => oLine += `${i > 0 ? ',' : ''}${x.value.id}`);
        logger(oLine);

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
