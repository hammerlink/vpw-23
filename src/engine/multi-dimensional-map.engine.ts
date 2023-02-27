import assert from 'assert';

export interface MDMapLocation<T> {
    dimensions: number[];
    value: T;
}

export interface Boundary {
    min: number;
    max: number;
}

export interface Dimension<T> {
    [d: number]: Dimension<T> | MDMapLocation<T>;
}

export class BasicMDMap<T> {
    boundaries: Boundary[];
    map: Dimension<T>;
    constructor(dimensions: number, boundaries?: Boundary[]) {
        if (boundaries === undefined) {
            this.boundaries = new Array(dimensions).map(_ => ({min: 0, max: 0}));
        } else {
            assert(boundaries.length === dimensions);
            this.boundaries = boundaries;
        }
        this.map = {};
    }
}

export namespace MDMapEngine {

}
