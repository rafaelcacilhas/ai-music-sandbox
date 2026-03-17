import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

export interface TrainingDataset{
    vocab: Record<number, string>;
    sequences: number[][];
    stats: {
        totalPatterns: number;
        totalTokens: number;
        vocabSize: number;
        maxSequenceLength: number;
        minSequenceLength: number;
    };
}

export function exportTrainingData(dataset:TrainingDataset, outputPath:string){
    const dir = dirname(outputPath);
    if(dir!=='.'){
        console.log('No dir - creating folder')
        try{mkdirSync(dir,{recursive:true})} catch{}
    }

    console.log('Saving to: ', outputPath)
    writeFileSync(outputPath, JSON.stringify(dataset,null, 2));
}

export function loadTrainingData(filePath:string):TrainingDataset{
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data);
}