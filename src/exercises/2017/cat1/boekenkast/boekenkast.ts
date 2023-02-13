import assert from 'assert';
import { readInputByTestCase, TestCaseHandler } from '../../../../engine/input.engine';

interface BoekenRek {
    breedte: number;
    filledBreedte?: number;
}

interface Boek {
    dikte: number;
    naam: string;
}

const boekenKastHandler = (testNumber: number): TestCaseHandler => {
    let rekken: BoekenRek[] | null = null;
    let boekenCount: number | null = null;
    const boeken: Boek[] = [];
    let finished = false;

    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (rekken === null) return (rekken = boekenRekkenParser(line));
        if (boekenCount === null) {
            boekenCount = parseInt(line, 10);
            if (boekenCount === 0) {
                finished = true;
                return logger(`${testNumber} 0`);
            }
            return;
        }

        boeken.push(boekenParser(line));
        if (boeken.length === boekenCount) {
            orderBooks(boeken);
            orderRekken(rekken);
            fillRekken(boeken, rekken, testNumber, logger);
            finished = true;
        }
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
const boekenRekkenParser = (line: string): BoekenRek[] => {
    const parts = line.split(' ').map(x => parseInt(x, 10));
    const count = parts.splice(0, 1)[0];
    assert.equal(count, parts.length, `invalid rekken count ${line}`);
    return parts.map(x => ({ breedte: x }));
};

const boekenParser = (line: string): Boek => {
    const match = line.match(/(\d+) (.*)/);
    assert.equal(!!match, true, `no book match found: ${line}`);
    return { dikte: parseInt(match[1], 10), naam: match[2] };
};
const orderBooks = (books: Boek[]) => {
    books.sort((a, b) => {
        if (a.naam < b.naam) return -1;
        if (a.naam > b.naam) return 1;
        return 0;
    });
};
const printOnmogelijk = (testNumber: number, logger: (line: string) => void) => logger(`${testNumber} ONMOGELIJK`);
const tryFitInRek = (book: Boek, rek: BoekenRek): boolean => {
    const remainingSpace = rek.breedte - (rek.filledBreedte ?? 0);
    if (remainingSpace >= book.dikte) {
        rek.filledBreedte = (rek.filledBreedte ?? 0) + book.dikte;
        return true;
    }
    return false;
};
const fillRekken = (books: Boek[], rekken: BoekenRek[], testNumber: number, logger: (line: string) => void) => {
    try {
        if (books.length && !rekken.length) return printOnmogelijk(testNumber, logger);
        let rekIndex = 0;
        let rek = rekken[rekIndex];
        for (let i = 0; i < books.length; i++) {
            const book = books[i];
            const fitsInCurrent = tryFitInRek(book, rek);
            if (!fitsInCurrent) {
                rekIndex++;
                if (rekIndex >= rekken.length) return printOnmogelijk(testNumber, logger);
                rek = rekken[rekIndex];
                const fitsInNext = tryFitInRek(book, rek);
                if (!fitsInNext) return printOnmogelijk(testNumber, logger);
            }
        }
        logger(`${testNumber} ${rekIndex + 1}`);
    } catch (e) {
        printOnmogelijk(testNumber, logger);
        console.error(e);
    }
};
const orderRekken = (rekken: BoekenRek[]) => {
    rekken.sort((a, b) => {
        // DESC BY breedte
        if (a.breedte < b.breedte) return 1;
        if (a.breedte > b.breedte) return -1;
        return 0;
    });
};

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(boekenKastHandler, fileName).then(_ => null);
}
