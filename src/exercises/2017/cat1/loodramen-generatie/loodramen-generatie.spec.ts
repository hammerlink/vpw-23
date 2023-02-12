import {loodramenGeneratieHandler} from './loodramen-generatie';
import {dirname, join} from 'path';
import {readInputByTestCase} from '../../../../engine/input.engine';
import assert from 'assert';

describe('loodramen generatie', function() {
   it('should run the opgave', async function() {
       const handler = loodramenGeneratieHandler;
       const exampleInputPath = join(dirname(__filename), 'opgave.invoer');
       await readInputByTestCase(handler, exampleInputPath);
       assert.equal(true, true);
   });

   it('should run the example', async function() {
       const handler = loodramenGeneratieHandler;
       const exampleInputPath = join(dirname(__filename), 'voorbeeld.invoer');
       await readInputByTestCase(handler, exampleInputPath);
       assert.equal(true, true);
   });
});
