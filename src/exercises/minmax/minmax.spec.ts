import { dirname, join } from 'path';
import { minMaxHandler } from './minmax';
import { readInputByTestCase, readOutput } from '@engine/input.engine';
import assert from 'assert';

describe('minmax', function () {
    it('should handle the example input', async function () {
        const handler = minMaxHandler;
        const exampleInputPath = join(dirname(__filename), 'voorbeeld.invoer');
        const programOutput = await readInputByTestCase(handler, exampleInputPath);
        const actualOutput = readOutput(join(dirname(__filename), 'voorbeeld.uitvoer'));
        assert.equal(programOutput.length, actualOutput.length);
        for (let i = 0; i < programOutput.length; i++) assert.equal(programOutput[i], actualOutput[i]);
    });
});
