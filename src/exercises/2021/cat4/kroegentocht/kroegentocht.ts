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

let globalBestScore: number | undefined;

function getBestScore(kroegen: Kroeg[], currentScore: number, budget: number, minimumPrijs: number, index = 0): number | undefined {
    if (index >= kroegen.length || budget < kroegen[index].prijs) {
        if (globalBestScore === undefined || currentScore > globalBestScore) globalBestScore = currentScore;
        return currentScore;
    }
    let bestScore: number | undefined;
    for (let i = index; i < kroegen.length; i++) {
        const x = kroegen[i];
        if (x.prijs > budget
            || (globalBestScore !== undefined && (currentScore + (x.availableScore as number)) < globalBestScore)) break;
        let score = getBestScore(kroegen, currentScore + x.score, budget - x.prijs, minimumPrijs, i + 1);
        if (score !== undefined && (bestScore === undefined || score > bestScore)) bestScore = score;
    }
    return bestScore ?? currentScore;
}

function buildRemainingScore(kroegen: Kroeg[]) {
    // supposes that the list is sorted on ascending price
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
    let minPrice: number | undefined;

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
        if (prijs > 0 && (minPrice === undefined || prijs < minPrice)) minPrice = prijs;
    });

    vpwHandler.handlers.push(new LineHandler((line: string) => {
        const numbers = lineToNumbers(line);
        budget = numbers[0];
        kroegenHandler.amount = numbers[1];
    }, 1));
    vpwHandler.handlers.push(kroegenHandler);

    vpwHandler.resultHandler = new LineHandler((line: string, logger: (line: string) => void) => {
        const frees = kroegen.filter(x => x.prijs === 0);
        const others = kroegen.filter(x => x.prijs !== 0)
            .sort((a, b) => a.prijs - b.prijs);
        buildRemainingScore(others);
        // .sort((a, b) => b.ratio - a.ratio);
        // get best price per ascending budget
        let baseScore = 0;
        for (let i = 0; i < frees.length; i++) baseScore += frees[i].score;

        globalBestScore = undefined;
        logger(`${testNumber} ${getBestScore(others, baseScore, budget as number, minPrice as number)}`);
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
