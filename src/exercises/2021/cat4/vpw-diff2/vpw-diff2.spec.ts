import { dirname, join } from 'path';
import assert from 'assert';
import { readInputByTestCase, readOutput } from '@engine/input.engine';
import {vpwDiffHandler} from './vpw-diff2';

describe('PLACEHOLDER', function () {
    const handler = vpwDiffHandler;

    it('should run the example', async function () {
        const exampleInputPath = join(dirname(__filename), 'voorbeeld.invoer');
        const programOutput = await readInputByTestCase(handler, exampleInputPath);
        const actualOutput = readOutput(join(dirname(__filename), 'voorbeeld.uitvoer'));
        assert.equal(programOutput.length, actualOutput.length);
        for (let i = 0; i < programOutput.length; i++) assert.equal(programOutput[i], actualOutput[i]);
    });

    it('should run the competition', async function () {
        const exampleInputPath = join(dirname(__filename), 'wedstrijd.invoer');
        const programOutput = await readInputByTestCase(handler, exampleInputPath);
        const actualOutput = readOutput(join(dirname(__filename), 'wedstrijd.uitvoer'));
        assert.equal(programOutput.length, actualOutput.length);
        for (let i = 0; i < programOutput.length; i++) assert.equal(programOutput[i], actualOutput[i]);
    });
});
