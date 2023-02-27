import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {lineToNumbers} from '@engine/line-input.engine';
import {LineHandler, VPWTestHandler} from '@engine/test.engine';

interface Kroeg {
    prijs: number;
    score: number;
    ratio: number;
    visited?: boolean;
    availableScore?: number;
    remainingPrice?: number;
}

let globalBestScore = 0;
let globalBudget = 0;
let globalBestRatio = 0;
let globalStop = false;
let startTime = new Date().getTime();

function checkScore(score: number, remainingBudget: number) {
    if (score > globalBestScore) {
        globalBestScore = score;
        globalBestRatio = score / (globalBudget - remainingBudget);
        // console.log(score, globalBestRatio.toFixed(2));
    }
}

function getBestScore(kroegen: Kroeg[], currentScore: number, budget: number, index = 0) {
    if (globalStop) return;
    checkScore(currentScore, budget);
    if (index >= kroegen.length) return;
    const currentRatio = (budget === globalBudget) ? 0 : currentScore / (globalBudget - budget);
    if (currentRatio < (globalBestRatio * (globalBudget - budget) / globalBudget)) return;
    for (let i = index; i < kroegen.length && !globalStop; i++) {
        const x = kroegen[i];
        if (x.prijs > budget) continue;
        if (new Date().getTime() > startTime + 350) globalStop = true;
        if (currentScore + (x.availableScore as number) < globalBestScore) return;
        if (budget >= (x.remainingPrice as number)) {
            checkScore(currentScore + (x.availableScore as number), budget - (x.remainingPrice as number))
            return;
        }
        getBestScore(kroegen, currentScore + x.score, budget - x.prijs, i + 1);
    }
}

function buildRemainingScore(kroegen: Kroeg[]) {
    // supposes that the list is sorted on price
    let remainingPrice = 0;
    let availableScore = 0;
    for (let i = kroegen.length - 1; i >= 0; i--) {
        const kroeg = kroegen[i];
        remainingPrice += kroeg.prijs;
        availableScore += kroeg.score;
        kroeg.remainingPrice = remainingPrice;
        kroeg.availableScore = availableScore;
    }
}

const handler = (testNumber: number): TestCaseHandler => {
    const vpwHandler = new VPWTestHandler();
    let budget: number | undefined;
    const kroegen: Kroeg[] = [];

    const kroegenHandler = new LineHandler((line: string) => {
        const numbers = lineToNumbers(line);
        const prijs = numbers[0];
        const score = numbers[1];
        kroegen.push({
            prijs: numbers[0],
            score: numbers[1],
            ratio: prijs > 0 ? score / prijs : 0,
        });
    });

    vpwHandler.handlers.push(new LineHandler((line: string) => {
        const numbers = lineToNumbers(line);
        globalBudget = numbers[0];
        kroegenHandler.amount = numbers[1];
    }, 1));
    vpwHandler.handlers.push(kroegenHandler);

    vpwHandler.resultHandler = new LineHandler((line: string, logger: (line: string) => void) => {
        const frees = kroegen.filter(x => x.prijs === 0);
        const others = kroegen.filter(x => x.prijs !== 0 && x.prijs < globalBudget);

        others.sort((a, b) => b.ratio - a.ratio);
        buildRemainingScore(others);
        // get best price per ascending budget
        let baseScore = 0;
        for (let i = 0; i < frees.length; i++) baseScore += frees[i].score;

        globalBestScore = 0;
        globalBestRatio = 0;
        globalStop = false;
        startTime = new Date().getTime();
        getBestScore(others, baseScore, globalBudget);
        logger(`${testNumber} ${globalBestScore}`);
    });
    return vpwHandler;
};
export const kroegenTochtHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
