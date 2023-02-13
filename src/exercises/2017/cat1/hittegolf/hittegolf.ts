import { readInputByTestCase, TestCaseHandler } from '../../../../engine/input.engine';
import { dirname, join } from 'path';

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const dayTemperatures: number[] = [];
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (line === 'stop') {
            const heatWaveIndex = hasHeatWave(dayTemperatures);
            if (heatWaveIndex === null) logger(`${testNumber} geen hittegolf`);
            else logger(`${testNumber} ${heatWaveIndex[0]} ${heatWaveIndex[1]}`);
            finished = true;
            return;
        }
        dayTemperatures.push(parseFloat(line));
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
export const hitteGolfHandler = handler;

function hasHeatWave(temperatures: number[]): [number, number] | null {
    for (let i = 0; i + 4 < temperatures.length; i++) {
        let dayCount = 0;
        let highTemperatureDayCount = 0;
        for (let d = i; d < temperatures.length; d++) {
            const temperature = temperatures[d];
            if (temperature < 25) break;
            dayCount++;
            if (temperature >= 30) highTemperatureDayCount++;
        }
        if (dayCount >= 5 && highTemperatureDayCount >= 3) {
            return [i + 1, dayCount];
        }
    }
    return null;
}

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
