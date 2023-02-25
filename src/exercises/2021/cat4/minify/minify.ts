import { dirname, join } from 'path';
import { readInputByTestCase, TestCaseHandler } from '@engine/input.engine';
import assert from 'assert';
import exp from 'constants';

const symbols = ['+', '-', '*', '/'];

export interface Expression {
   varName: string;
   expressionParts: string[];
   symbols: string[];
   rawExpression: string;
   output: string;
}

export interface VarList {
    [minifiedVarName: string] : {
       varCount: number;
    }
}


const handler = (testNumber: number): TestCaseHandler => {
    let finished = false;
    let amount: number | undefined;
    const lines: Expression[] = [];
    let nextVarName = 'a';
    const knownVars: {[name: string]: string} = {};

    const getVarName = (name: string) => {
        if (knownVars[name]) return knownVars[name];
        knownVars[name] = nextVarName;
        nextVarName += 'a';
        return knownVars[name];
    };
    const lineHandler = (line: string, logger: (line: string) => void) => {
        if (amount === undefined) {
            amount = parseInt(line);
            return;
        }
        const parsedLine = line.replace(/\s/g, '');
        const parts = parsedLine.split(/=/);
        assert(parts.length === 2);
        const varName = parts[0];
        const expressionParts = parts[1].split(/[\+\-\*\/]/);
        const symbols = parts[1].match(/[\+\-\*\/]/g)?.map(x => x) ?? [];
        lines.push({
            varName,
            expressionParts,
            rawExpression: parts[1],
            output: parsedLine,
            symbols,
        });
        if (lines.length < amount) return;

        lines.forEach(expression => {
            let output = `${expression.varName, getVarName(expression.varName)}=`;
            let symbolCounter = 0;
            for (let i = 0; i < expression.expressionParts.length; i++) {
                const part = expression.expressionParts[i];
                const isNumber = part.match(/\d+/);
                output += isNumber ? part : getVarName(part);
                if (i === expression.expressionParts.length - 1) break;
                output += expression.symbols[symbolCounter];
                symbolCounter++;
            }
            logger(`${testNumber} ${output}`);
        });


        finished = true;
    };
    const isDone = () => finished;
    return { lineHandler, isDone };
};
export const minifyHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const { join, dirname } = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
