export interface Note {
    pitch: number;          // MIDI note number (0-127)
    startTime: number;      // In ticks
    duration: number;       // In ticks
    velocity: number;       // 0-127
    track?: number; 
}

export interface Pattern {
  id: string;
  notes: Note[];
  tempo: number;        // BPM
  timeSignature: [number, number]; // e.g., [4, 4]
  key?: string;         // optional key detection
  source: string;       // original file
  barCount: number;
}

export interface ParsedMidi {
    filename: string;
    tempo: number;          // Microseconds per quarter note
    ticksPerBeat: number;
    notes: Note[];
    metadata: {
        title?: string;
        composer?: string;
        copyright?: string;
    };
}

export interface TokenizedPattern {
  patternId: string;
  tokens: number[];
  metadata: {
    tempo: number;
    timeSignature: [number, number];
    noteCount: number;
  };
}

export interface QuantizeOptions {
    resolution: 4 | 8 | 16;     // Quarter, eighth, sixteenth notes
    minNoteLength: number;      // Minimum ticks to keep
}

export interface GameboyPattern extends Pattern {
  channel: 'pulse1' | 'pulse2' | 'wave' | 'noise';
  length: number;       // pattern length in bars (usually 64 steps for LSDJ)
}

export interface ProcessedTrack{
  any: any
}
