import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {lineToNumbers} from '@engine/line-input.engine';
import assert from 'assert';


function swapPositions(appList: number[], i1: number, i2: number): boolean {
    if (i1 < 0 || i2 < 0) return false;
    const v1 = appList[i1];
    appList[i1] = appList[i2];
    appList[i2] = v1;
    return true;
}

function getRequiredSwipesForAppCall(appIndex: number, appsPerScreen: number): number {
    return Math.floor(appIndex / appsPerScreen);
}

function calculateSwipes(appList: number[], appsPerScreen: number, appCalls: number[]): number {
    let swipes = 0;
    appCalls.forEach(appIndex => {
        const app = appList.find(x => x === appIndex);
        if (app === undefined) return;
        const currentIndex = appList.indexOf(app);

        swipes += getRequiredSwipesForAppCall(currentIndex, appsPerScreen);

        swapPositions(appList, currentIndex, currentIndex - 1); // execute app call
    })

    return swipes;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let appsPerScreenCount: number | undefined;
    let appCount: number | undefined;
    let callCount: number | undefined;
    let apps: number[] | undefined;
    let calls: number[] | undefined;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (appsPerScreenCount === undefined) {
            const numbers = lineToNumbers(line);
            assert(numbers.length === 3, `invalid first line ${line}`);
            appsPerScreenCount = numbers[0];
            appCount = numbers[1];
            callCount = numbers[2];
            return;
        }
        if (apps === undefined) return apps = lineToNumbers(line);

        calls = lineToNumbers(line);
        const swipeCount = calculateSwipes(apps, appsPerScreenCount, calls);
        logger(`${testNumber} ${swipeCount}`);

        finished = true;
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const appLijstHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
