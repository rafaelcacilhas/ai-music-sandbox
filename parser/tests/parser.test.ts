
import { loadMidiFile, extractNotes  } from "../core/midi-parser";

const TEST_MIDI_PATH = '../dataset/villa_lobos/villa.mid'

describe('MIDI Parser - Unit Tests', () => {
    it('should load a file in dataset', () => {
        const midiData = loadMidiFile(TEST_MIDI_PATH);
        expect(midiData).toBeDefined;
    });
});

describe('MIDI Parser - Real Files', () => {
  it('should extract notes from a simple Villa-Lobos piece', () => {
    const midiData = loadMidiFile(TEST_MIDI_PATH);
    const notes = extractNotes(midiData);
    
    expect(notes.length).toBeGreaterThan(0);
    expect(notes[0].pitch).toBeGreaterThanOrEqual(0);
    expect(notes[0].pitch).toBeLessThanOrEqual(127);
    expect(notes[0].duration).toBeGreaterThan(0);
    
    // console.log(`Extracted ${notes.length} notes from Villa-Lobos`);
    // console.log('First few notes:', notes.slice(0, 5));
  })
});