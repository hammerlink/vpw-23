import {dirname, join} from 'path';
import {readInputByTestCase, TestCaseHandler} from '@engine/input.engine';

const handler = (testNumber: number): TestCaseHandler => {

    interface Home {
        id: string;
        targetIds?: Home[];
    }


    let finished = false;
    let amountOfExercises: number | null = null;
    let list: string[][] = []
    const lineHandler = (line: string, logger: (line: string) => void) => {

        if (amountOfExercises === null) {
            amountOfExercises = parseInt(line);
            return;
        }

        let maxMoves = 0;

        if (list.length < amountOfExercises) {
            list.push(line.split(" "));
            if (list.length < amountOfExercises) {
                return;
            }
        }

        const homes: { [id: string]: Home } = {};


        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const homeId = item[0];
            if (!homes[homeId]) homes[homeId] = {id: homeId};
            const targetsIds = item.splice(1).map(targetId => {
                if (!homes[targetId]) homes[targetId] = {id: targetId};
                return homes[targetId];
            })
            homes[homeId].targetIds = targetsIds;
        }

        let amountOfHomesInTotal = 0;
        for (const homeId in homes) {
            amountOfHomesInTotal = amountOfHomesInTotal + 1;
        }


        function move(startHome: Home, movedTo: Home, visitedHomes: Home[], amountOfMoves: number) {
            movedTo.targetIds?.forEach(
                value => {
                    if (value === startHome && amountOfMoves > maxMoves) {
                        maxMoves = amountOfMoves + 1;
                        if (visitedHomes.length < amountOfHomesInTotal) {
                            //find another home looper to move as much as possible
                            for (const homeId in homes) {
                                const startHomeV2 = homes[homeId];
                                if (!visitedHomes.includes(startHomeV2)) {
                                    const newVisitList = visitedHomes;
                                    newVisitList.push(startHomeV2);
                                    move(startHomeV2, startHomeV2, newVisitList, amountOfMoves + 1);
                                }
                            }
                        }
                    }
                    if (!visitedHomes.includes(value)) {
                        //has not visited this home yet
                        const newVisitList = visitedHomes;
                        newVisitList.push(value);

                        //has no options anymore check if can move back to start and increase amountOfMoves if necessary

                        move(startHome, value, newVisitList, amountOfMoves + 1);
                    }
                }
            )
        }

        for (const homeId in homes) {
            const home = homes[homeId];
            let emptyVisitedHomes: Home[] = []
            move(home, home, emptyVisitedHomes, 0);

        }

        logger(testNumber + " " + maxMoves)
        finished = true;
    };
    const isDone = () => finished;
    return {lineHandler, isDone};
};

export const templateHandler = handler;

if (require.main) {
    let fileName = undefined;
    if (process.argv[2]) {
        const {join, dirname} = require('path');
        fileName = join(dirname(__filename), process.argv[2]);
    }
    readInputByTestCase(handler, fileName).then(_ => null);
}
