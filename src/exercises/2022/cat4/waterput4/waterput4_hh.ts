import { dirname, join } from 'path';
import { readInputByTestCase, TestCaseHandler } from '@engine/input.engine';
import {lineToNumbers} from '@engine/line-input.engine';
import assert from 'assert';

interface WaterPut {
    waterHoogte: number;
    buisHoogte: number;
    availableWater: number;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        const numbers = lineToNumbers(line);
        assert(numbers.length === 4);
        const vatO: WaterPut = {waterHoogte: numbers[0], buisHoogte: numbers[2], availableWater: 0};
        if (vatO.waterHoogte > vatO.buisHoogte) vatO.availableWater = vatO.waterHoogte - vatO.buisHoogte;
        const vatW: WaterPut = {waterHoogte: numbers[1], buisHoogte: numbers[3], availableWater: 0};
        if (vatW.waterHoogte > vatW.buisHoogte) vatW.availableWater = vatW.waterHoogte - vatW.buisHoogte;
        const highestWater = Math.max(vatW.waterHoogte, vatO.waterHoogte);
        const highestBuis = Math.max(vatO.buisHoogte, vatW.buisHoogte);
        let availableWaterDelta = highestWater - highestBuis;

        const waterLevel = (vatO.waterHoogte + vatW.waterHoogte) / 2;
        const highestPut = vatO.waterHoogte > vatW.waterHoogte ? vatO : vatW;
        const lowestPut = vatO.waterHoogte > vatW.waterHoogte ? vatW : vatO;

        const highestToLevelDelta = highestPut.waterHoogte - waterLevel;
        if (availableWaterDelta > highestToLevelDelta) availableWaterDelta = highestToLevelDelta;

        if (availableWaterDelta > 0) {
            highestPut.waterHoogte -= availableWaterDelta;
            lowestPut.waterHoogte += availableWaterDelta;
        }

        if (vatO.waterHoogte === vatW.waterHoogte) logger(`${testNumber} gelijk`);
        else logger(`${testNumber} ${vatO.waterHoogte} ${vatW.waterHoogte}`);

        finished = true;
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
export const waterPutHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
