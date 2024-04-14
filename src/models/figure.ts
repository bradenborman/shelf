export interface Figure {
    path: string;
    color: any;
    boxWidth: number;
    boxHeight: number;
    boxDepth: number;
    shiftOverride: number;
}

export interface Shelf {
    index: number;
    figures: Figure[];
}

