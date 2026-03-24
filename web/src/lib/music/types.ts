export interface Note {
  pitch: number;
  duration: number;
  velocity: number;
}

export interface GenerationParams {
  temperature: number;
  length: number;
  seed?: number;
}

export interface  BigramModel {
  counts: Record<string, Record<string, number>>;
  vocab: Record<number, string>;
}