import {dirname, join} from 'path';
import assert from 'assert';
import {getParametersFromRawSnake, trySlang, vietnameseSlangHandler} from './vietnamese-slang';
import {readInputByTestCase, readOutput} from '../../../../engine/input.engine';

describe('vietnameseSlangHandler', function () {
    const handler = vietnameseSlangHandler;

    it('should run the example', async function () {
        const exampleInputPath = join(dirname(__filename), 'voorbeeld.invoer');
        const programOutput = await readInputByTestCase(handler, exampleInputPath);
        const actualOutput = readOutput(join(dirname(__filename), 'voorbeeld.uitvoer'));
        assert.equal(programOutput.length, actualOutput.length);
        for (let i = 0; i < programOutput.length; i++) assert.equal(programOutput[i], actualOutput[i]);
    });

    it('should run the competition', async function () {
        this.timeout(10_000);
        const exampleInputPath = join(dirname(__filename), 'wedstrijd.invoer');
        const programOutput = await readInputByTestCase(handler, exampleInputPath);
        const actualOutput = readOutput(join(dirname(__filename), 'wedstrijd.uitvoer'));
        assert.equal(programOutput.length, actualOutput.length);
        for (let i = 0; i < programOutput.length; i++) assert.equal(programOutput[i], actualOutput[i]);
    });

    it('should getParametersFromRawSnake', function() {
        const params = getParametersFromRawSnake('2 + 7 * 15 + 8 * 13 + 9 + 11 * A - B * 14 - 5 - 6 * 16 - 10 * 1 + 12 = 15');
        assert(params.includes('A'));
        assert(params.includes('B'));
    });

    it('should trySlang', function() {
        assert(trySlang('15 * 3 + 4', 49));
        assert(trySlang('15 * 3 + 4', 50) === false);
    });
});
