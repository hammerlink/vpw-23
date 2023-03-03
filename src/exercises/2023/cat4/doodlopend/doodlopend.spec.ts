import { dirname, join } from 'path';
import assert from 'assert';
import DoodlopendHanlder from './doodlopend';
import { readInputByTestCase, readOutput } from '@engine/input.engine';

describe('PLACEHOLDER', function () {
    const handler = DoodlopendHanlder;

    it('should run the example', async function () {
        const exampleInputPath = join(dirname(__filename), 'voorbeeld.invoer');
        const programOutput = await readInputByTestCase(handler, exampleInputPath);
        const actualOutput = readOutput(join(dirname(__filename), 'voorbeeld.uitvoer'));
        assert.equal(programOutput.length, actualOutput.length);
        for (let i = 0; i < programOutput.length; i++) assert.equal(programOutput[i], actualOutput[i]);
    });
});
