import { readInputByTestCase, TestCaseHandler } from '@engine/input.engine';
import { lineToNumbers } from '@engine/line-input.engine';

const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    const lineHandler = (line: string, logger: (line: string) => void) => {
        const numbers = lineToNumbers(line);

        let levels = [numbers[0], numbers[1]];
        let holes = [numbers[2], numbers[3]];

        let max_level = Math.max(...levels);
        let max_level_index = levels.indexOf(max_level);

        let min_level = Math.min(...levels);
        let min_level_index = levels.indexOf(min_level);

        let to_divide = max_level - holes[max_level_index];

        let first_arg = 0;
        let last_arg = 0;

        if (
            to_divide == 0 ||
            to_divide < 0 ||
            min_level == max_level ||
            holes[min_level_index] > holes[max_level_index]
        ) {
            first_arg = levels[0];
            last_arg = levels[1];
        } else {
            let new_level_min = min_level + to_divide;
            let new_level_max = max_level - to_divide;
            if (new_level_min <= new_level_max) {
                first_arg = min_level_index == 0 ? new_level_min : new_level_max;
                last_arg = min_level_index == 0 ? new_level_max : new_level_min;
            } else {
                first_arg = min_level + max_level / 2;
                last_arg = min_level + max_level / 2;
            }
        }

        if (first_arg != last_arg) {
            logger(`${testNumber} ${first_arg} ${last_arg}`);
        } else {
            logger(`${testNumber} gelijk`);
        }

        finished = true;
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
export const waterPutHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
