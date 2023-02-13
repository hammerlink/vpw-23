import { hitteGolfHandler } from './hittegolf';
import { dirname, join } from 'path';
import { readInputByTestCase, readOutput } from '../../../../engine/input.engine';
import assert from 'assert';

describe('hittegolf', function () {
    it('should run the example', async function () {
        const handler = hitteGolfHandler;
        const exampleInputPath = join(dirname(__filename), 'voorbeeld.invoer');
        const programOutput = await readInputByTestCase(handler, exampleInputPath);
        const actualOutput = readOutput(join(dirname(__filename), 'voorbeeld.uitvoer'));
        assert.equal(programOutput.length, actualOutput.length);
        for (let i = 0; i < programOutput.length; i++) assert.equal(programOutput[i], actualOutput[i]);
    });
});
