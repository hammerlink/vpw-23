import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';
import assert from 'assert';

interface Card {
    color: number;
    value: number;
}

enum CardColor {
    Schoppen = 'S',
    Harten = 'H',
    Klavers = 'K',
    Ruiten = 'R',
}

const colorValueMap = {
    [CardColor.Klavers]: 0,
    [CardColor.Ruiten]: 1,
    [CardColor.Harten]: 2,
    [CardColor.Schoppen]: 3,
};

function colorValue(color: CardColor): number {
    return colorValueMap[color];
}
function valueToColor(value: number): CardColor {
    if (value === 0) return CardColor.Klavers;
    if (value === 1) return CardColor.Ruiten;
    if (value === 2) return CardColor.Harten;
    return CardColor.Schoppen;
}

function parseCardValue(value: string): number {
    if (value === 'A') return 1;
    if (value === 'B') return 11;
    if (value === 'V') return 12;
    if (value === 'H') return 13;
    return parseInt(value);
}

function valueToCard(value: number): string {
    if (value === 1) return 'A';
    if (value === 11) return 'B';
    if (value === 12) return 'V';
    if (value === 13) return 'H';
    return `${value}`;
}

function getSteps(preSortedCards: Card[], testNumber: number): number {
    const selfSortedCards = preSortedCards.slice(0).sort((a, b) => {
        if (a.value !== b.value) return a.value - b.value;
        return a.color - b.color;
    });
    const lowestIndex = preSortedCards.indexOf(selfSortedCards[0]);
    const highestIndex = preSortedCards.indexOf(selfSortedCards[2]);
    if (lowestIndex === 0) {
        if (highestIndex === 1) return 2;
        return 1;
    }
    if (highestIndex === 0) {
        if (lowestIndex === 1) return 5;
        return 6;
    }
    if (lowestIndex === 1) return 3;
    return 4;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        finished = true;
        const cards: Card[] = line.split(' ').map(x => ({
            color: colorValue(x[0] as CardColor),
            value: parseCardValue(x.substring(1)),
        }));
        assert(cards.length === 4);
        const nextCardColor = cards[0].color;
        const preSortedCards = cards.slice(1);
        const steps = getSteps(preSortedCards, testNumber);
        let nextCardValue = (cards[0].value+ steps);
        if (nextCardValue > 13) nextCardValue = nextCardValue % 13;
        logger(`${testNumber} ${valueToColor(nextCardColor)}${valueToCard(nextCardValue)}`);
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};
export const vijfdeKaartHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
