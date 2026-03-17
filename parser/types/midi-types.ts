// types/midi-types.ts
export interface MidiHeader {
  format: 0 | 1 | 2;        // 0=single track, 1=multiple tracks, 2=multiple songs
  trackCount: number;
  division: number;          // ticks per quarter note
  // or framerate (SMPTE) - less common, we can handle later
}

export interface MidiEvent {
  deltaTime: number;         // ticks since last event
  type: 'noteOn' | 'noteOff' | 'programChange' | 'controlChange' | 'meta' | 'sysex';
  channel?: number;          // 0-15
  noteNumber?: number;       // 0-127
  velocity?: number;         // 0-127
}

export interface MidiTrack {
  events: MidiEvent[];
}

export interface MidiFile {
  header: MidiHeader;
  tracks: MidiTrack[];
}
