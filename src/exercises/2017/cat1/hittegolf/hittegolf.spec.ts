import {describe, it} from 'node:test';
import {hitteGolfHandler} from './hittegolf';
import {dirname, join} from 'path';
import {readInputByTestCase} from '../../../../engine/input.engine';
import assert from 'assert';

describe('hittegolf', function() {
   it('should run the example', async function() {
       const handler = hitteGolfHandler;
       const exampleInputPath = join(dirname(__filename), 'voorbeeld.invoer');
       await readInputByTestCase(handler, exampleInputPath);
       assert.equal(true, true);
   });
});
