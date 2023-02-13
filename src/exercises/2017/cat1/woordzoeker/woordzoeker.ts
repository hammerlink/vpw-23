import { dirname, join } from 'path';
import { readInputByTestCase, TestCaseHandler } from '@engine/input.engine';
import { lineToNumbers } from '@engine/line-input.engine';
import assert from 'assert';
import { BasicMap, MapEngine, MapLocation } from '@engine/map.engine';

interface Cell {
    isRemoved?: boolean;
    letter: string;
}

function findWordInRaster(raster: BasicMap<Cell>, word: String) {
    if (!word.length) return;
    const firstLetter = word[0];
    MapEngine.iterateMap(raster, (cell, stopIteration) => {
        if (cell?.value.letter === firstLetter) {
            let result: MapLocation<Cell>[] | null = null;
            if (word.length > 1) {
                const adjacentCells = MapEngine.getAdjacentPoints(raster, cell.x, cell.y).filter(
                    x => x?.value.letter === word[1],
                );
                for (let i = 0; i < adjacentCells.length; i++) {
                    const adjacentCell = adjacentCells[i];
                    if (adjacentCell === null) continue;
                    const xDirection = adjacentCell.x - cell.x;
                    const yDirection = adjacentCell.y - cell.y;
                    result = tryMakeWord(raster, word, [cell, adjacentCell], xDirection, yDirection);
                    if (result !== null) break;
                }
            } else result = [cell];
            if (result !== null) {
                result.forEach(x => (x.value.isRemoved = true));
                stopIteration();
            }
        }
    });
}

function tryMakeWord(
    raster: BasicMap<Cell>,
    word: String,
    cells: MapLocation<Cell>[],
    xDirection: number,
    yDirection: number,
): MapLocation<Cell>[] | null {
    while (cells.length < word.length) {
        let { x, y } = cells[cells.length - 1];
        let nextCell = MapEngine.getPoint(raster, x + xDirection, y + yDirection);
        if (nextCell?.value.letter !== word[cells.length]) return null;
        cells.push(nextCell);
    }
    return cells;
}

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let wordCount: number | undefined;
    const words: string[] = [];
    const raster: BasicMap<Cell> = MapEngine.newMap(0, 0);
    let yCount = 0;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (wordCount === undefined) {
            const numbers = lineToNumbers(line);
            assert(numbers.length === 3, `invalid first line ${line}`);
            wordCount = numbers[0];
            raster.maxY = numbers[1];
            raster.maxX = numbers[0];
            return;
        }
        if (words.length < wordCount) return words.push(line);
        for (let i = 0; i < line.length; i++) MapEngine.setPointInMap(raster, i, yCount, { letter: line[i] });
        yCount++;

        if (yCount >= raster.maxY) {
            words
                .sort((a, b) => b.length - a.length) // long words first
                .forEach(word => findWordInRaster(raster, word));
            let remainingLetters = '';
            MapEngine.iterateMap(raster, cell => {
                if (cell && !cell?.value.isRemoved) remainingLetters += cell.value.letter;
            });
            logger(`${testNumber} ${remainingLetters}`);
            finished = true;
        }
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
export const woordZoekerHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
