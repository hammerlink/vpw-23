import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import {lineToNumbers} from '@engine/line-input.engine';

interface Kroeg {
    prijs: number;
    score: number;
    ratio: number;
    visited?: boolean;
}
let highScore: number | undefined;
function getBestScore(kroegen: Kroeg[], currentScore: number, budget: number, minimumPrijs: number): number | undefined {
    if (budget < minimumPrijs) return currentScore;
    let bestScore: number | undefined;
    let visitCount = 0;
    kroegen.forEach(x => {
        if (x.visited || x.prijs > budget) return;
        x.visited = true;
        visitCount++;
        let score = getBestScore(kroegen, currentScore + x.score, budget - x.prijs, minimumPrijs);
        if (score !== undefined && (bestScore === undefined || score > bestScore)) bestScore = score;
        x.visited = false;
    });
    if (visitCount === 0) return currentScore;
    return bestScore;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let budget: number | undefined;
    let kroegenCount: number | undefined;
    let minPrice: number | undefined;

    const kroegen: Kroeg[] = [];
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (budget === undefined || kroegenCount === undefined) {
            const numbers = lineToNumbers(line);
            budget = numbers[0];
            kroegenCount = numbers[1];
            return;
        }
        const numbers = lineToNumbers(line);
        const prijs = numbers[0];
        const score = numbers[1];
        kroegen.push({
            prijs: numbers[0],
            score: numbers[1],
            ratio: prijs > 0 ? score / prijs : 0,
        });
        if (prijs > 0 && (minPrice === undefined || prijs < minPrice)) minPrice = prijs;

        if (kroegen.length < kroegenCount) return;
        const frees = kroegen.filter(x => x.prijs === 0);
        const others = kroegen.filter(x => x.prijs !== 0)
            .sort((a, b) => b.ratio - a.ratio);
        let baseScore = 0;
        for (let i = 0; i < frees.length; i++) baseScore += frees[i].score;

        logger(`${testNumber} ${getBestScore(others, baseScore, budget, minPrice as number)}`);

        finished = true;
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
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
