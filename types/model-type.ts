export interface TokenizedDataset {
  vocab: {
    id: number;
    token: string;        // e.g., "NOTE_60", "DUR_480", "<SOS>"
    type: 'note' | 'duration' | 'special' | 'time_shift';
  }[];
  
  sequences: number[][];  
  
  stats: {
    totalTokens: number;
    vocabSize: number;
    maxSequenceLength: number;
  };
}

    const exampleSequence = [
  1,    // <SOS> (Start of Sequence)
  60,  // NOTE_60 (C4)
  480, // DUR_480 (quarter note)
  62,  // NOTE_62 (D4)
  240, // DUR_240 (eighth note)
  64,  // NOTE_64 (E4)
  480, // DUR_480
  2    // <EOS> (End of Sequence)
];