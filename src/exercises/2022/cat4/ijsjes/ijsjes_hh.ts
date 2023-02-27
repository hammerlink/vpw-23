import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {lineToNumbers} from '@engine/line-input.engine';
import assert from 'assert';

interface CrossPoint {
    id: string;
    connections: {
        [targetCrossPointId: string]: Street;
    };
    bestRoutes: {
        [crossPointId: string]: number;
    }
}

interface Street {
    c1: CrossPoint;
    c2: CrossPoint;
    streetLength: number;
    mustVisit: boolean;
}

interface CrossPointMap {
    [id: string]: CrossPoint;
}

function getCrossPointOrDefault(id: string, map: CrossPointMap): CrossPoint {
    if (!map[id]) {
        map[id] = {id, connections: {}, bestRoutes: {}};
    }
    return map[id];
}

function parseStreet(line: string, map: CrossPointMap): Street {
    const parts = line.split(' ');
    const c1 = getCrossPointOrDefault(parts[0], map);
    const c2 = getCrossPointOrDefault(parts[1], map);
    const street: Street = {
        c1,
        c2,
        streetLength: parseInt(parts[2]),
        mustVisit: parts[3] === '1'
    };
    // connect street
    c1.connections[c2.id] = street;
    c2.connections[c1.id] = street;
    return street;
}

interface StreetVisits {
    street: Street,
    visited: boolean
}

interface IterateState {
    currentPoint: CrossPoint;
    streetsToVisit: StreetVisits[];
    passedCrossPointIds: string[];
    currentScore: number;
    bestScore?: number;
}

function searchOptimalRoute(map: CrossPointMap, startPoint: CrossPoint, streets: Street[]): number {
    const streetsToVisit: StreetVisits[] = streets.filter(x => x.mustVisit).map(x => ({street: x, visited: false}));

    const state: IterateState = {
        currentPoint: startPoint,
        streetsToVisit,
        passedCrossPointIds: [],
        currentScore: 0,
    }
    iterateRoutes(map, state);
    assert(state.bestScore !== undefined);
    return state.bestScore;
}

function iterateRoutes(map: CrossPointMap, state: IterateState): number {
    let {currentPoint, currentScore, bestScore, streetsToVisit} = state;

    streetsToVisit.forEach(streetToVisit => {
        const {street: {streetLength, c2, c1}} = streetToVisit;
        const c1Length = searchBestRouteBetweenPoints(map, currentPoint, c1, [currentPoint.id]);
        const c2Length = searchBestRouteBetweenPoints(map, currentPoint, c2, [currentPoint.id]);
        const goToC1 = c1Length < c2Length;
        const nextState: IterateState = {
            ...state,
            currentPoint: goToC1 ? c2 : c1, //goToC1 and go through street, end at the other point
            currentScore: currentScore + streetLength,
            streetsToVisit: streetsToVisit.filter(x => x !== streetToVisit)
        }
        if (bestScore === undefined || bestScore > nextState.currentScore) {
            const score = iterateRoutes(map, nextState);
            if (bestScore === undefined || score < bestScore) bestScore = score;
        }
    });
    assert(bestScore !== undefined);
    return bestScore;
}

function searchBestRouteBetweenPoints(map: CrossPointMap, c1: CrossPoint, c2: CrossPoint, visitedPointIds: string[]): number {
    if (c1.bestRoutes[c2.id]) return c1.bestRoutes[c2.id];
    const targetId = c2.id;
    let current: CrossPoint = c1;
    let bestScore: number | null = null;
    // can be null as it may not be a good route
    for (const cId in current.connections) {
        const {streetLength, c2: nextPoint} = c1.connections[cId];
        if (nextPoint.id === targetId) {
            if (bestScore === null || streetLength < bestScore) bestScore = streetLength;
            continue;
        }
        if (!visitedPointIds.includes(nextPoint.id)) {
            const score = searchBestRouteBetweenPoints(map, nextPoint, c2, [...visitedPointIds, nextPoint.id]);
            if (score === null) continue;
            if (bestScore === null || score < bestScore) bestScore = score;
        }
    }
    assert(bestScore !== null);
    c1.bestRoutes[c2.id] = bestScore;
    return bestScore;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let streetCount: number | undefined;
    let crossPointCount: number | undefined;
    const streets: Street[] = [];
    const map: CrossPointMap = {};
    let startCrossPointId: number | undefined;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (streetCount === undefined) {
            const numbers = lineToNumbers(line);
            assert(numbers.length === 2);
            streetCount = numbers[0];
            crossPointCount = numbers[1];
            return;
        }
        if (streets.length < streetCount) {
            streets.push(parseStreet(line, map));
            return;
        }
        startCrossPointId = parseInt(line);
        let startCrossPoint = map[startCrossPointId];
        const result = searchOptimalRoute(map, startCrossPoint, streets);
        logger(`${testNumber} ${result}`)
        finished = true;
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const ijsjesHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
