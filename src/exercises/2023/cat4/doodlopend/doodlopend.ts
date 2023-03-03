import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {LineHandler, VPWTestHandler} from '@engine/test.engine';
import {lineToNumbers} from '@engine/line-input.engine';

interface CrossPoint {
    id: number;
    connections: {
        [id:number]: CrossPoint;
    },
    doodlopend: {
        [id: number]: boolean;
    };
}

interface Street {
    a: CrossPoint;
    b: CrossPoint;
}

function getCrossPoint(id: number, points: CrossPoint[]) {
    let crossPoint = points.find(x => x.id === id);
    if (crossPoint) return crossPoint;
    crossPoint = {
        id,
        connections: {},
        doodlopend: {},
    } as CrossPoint;
    points.push(crossPoint);
    return crossPoint;
}

function checkDoodlopend(point: CrossPoint, doodloopId: number, targetPoint: CrossPoint) {
    point.doodlopend[doodloopId] = true;
    for (const nextId in point.connections) {
        const next = point.connections[nextId];
        if (next.doodlopend[doodloopId]) continue;

    }
}

const handler = (testNumber: number): TestCaseHandler => {
    const vpwHandler = new VPWTestHandler();

    const points: CrossPoint[] = [];
    const crossPointHandler = new LineHandler((line: string) => {
        const parts = lineToNumbers(line);
        const cross1 = getCrossPoint(parts[0], points);
        const cross2 = getCrossPoint(parts[1], points);
        cross1.connections[cross2.id] = cross2;
        cross2.connections[cross1.id] = cross1;
    });

    vpwHandler.handlers.push(new LineHandler((line: string) => {
        crossPointHandler.amount = parseInt(line);
    }, 1));
    vpwHandler.handlers.push(crossPointHandler);

    vpwHandler.resultHandler = new LineHandler((line: string, logger: (line: string) => void) => {
        const resultList: CrossPoint[] = points.filter(x => Object.keys(x.connections).length === 1);

        logger(`${testNumber} geen`);
    });
    return vpwHandler;
};
export default handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
