import {TestCaseHandler} from '@engine/input.engine';
import assert from 'assert';

export class LineHandler {
    amount?: number;
    isDone?: boolean;
    counter: number;
    handler: (line: string, logger: (line: string) => void) => void;

    public constructor(handler: (line: string, logger: (line: string) => void) => void, amount?: number) {
        this.counter = 0;
        this.handler = handler;
        this.amount = amount;
    }

    public isAvailable(): boolean {
        if (this.amount !== undefined && this.counter === this.amount) return false;
        return this.isDone ?? true;
    }

    public handleLine(line: string, logger: (line: string) => void) {
        this.handler(line, logger);
        this.counter++;
    }
}

export class VPWTestHandler implements TestCaseHandler {
    finished = false;
    handlers: LineHandler[] = [];
    resultHandler?: LineHandler;
    handlerIndex = 0;
    currentHandler?: LineHandler;

    public constructor() {
    }

    getHandler(): LineHandler | undefined {
        if (this.handlerIndex >= this.handlers.length) return undefined;
        const handler = this.handlers[this.handlerIndex];
        if (handler.isAvailable()) return handler;
        this.handlerIndex++;
        return this.getHandler();
    }

    lineHandler(line: string, logger: (line: string) => void) {
        this.currentHandler = this.getHandler();
        if (this.currentHandler !== undefined) {
            this.currentHandler.handleLine(line, logger);
        }
        // get the next handler, in case this is undefined the test needs to be parsed
        this.currentHandler = this.getHandler();
        if (this.currentHandler === undefined) {
            assert(this.resultHandler !== undefined);
            this.resultHandler.handleLine(line, logger);
            this.finished = true;
        }
    }

    public isDone(): boolean {
        return this.finished;
    }
}
