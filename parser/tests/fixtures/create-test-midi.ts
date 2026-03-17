import { writeFileSync } from 'fs';
import { join } from 'path';

export function createTestMidiBuffer(): Buffer {
  const header = Buffer.concat([
    Buffer.from('MThd', 'ascii'),
    Buffer.from([0x00, 0x00, 0x00, 0x06]), // chunk length
    Buffer.from([0x00, 0x00]), // format 0
    Buffer.from([0x00, 0x01]), // 1 track
    Buffer.from([0x00, 0x60]), // 96 ticks per quarter
  ]);

  const trackEvents = [
    0x00, 0xFF, 0x51, 0x03, 0x0A, 0x2F, 0x00,  // delta=0, meta tempo, length=3, value=500000
    0x00, 0x90, 0x3C, 0x64,  // delta=0, note on, note=60(C4), vel=100
    0x60, 0x80, 0x3C, 0x40,  // delta=1 tempo, note off, note=60, vel=64
    0x00, 0xFF, 0x2F, 0x00   // delta=0, meta end of track, length=0
  ];

  const trackData = Buffer.from(trackEvents);
  const trackLength = trackData.length;
  
  const trackHeader = Buffer.concat([
    Buffer.from('MTrk', 'ascii'),
    Buffer.from([0x00, 0x00, 0x00, trackLength]), // 4-byte length
  ]);

  const track = Buffer.concat([trackHeader, trackData]);
  
  return Buffer.concat([header, track]);
}

export function saveTestMidiFile() {
  const buffer = createTestMidiBuffer();
  writeFileSync(join(__dirname, 'test-note.mid'), buffer);
  console.log('Test MIDI file created at tests/fixtures/test-note.mid');
}

// Run with: ts-node tests/fixtures/create-test-midi.ts
if (require.main === module) {
  saveTestMidiFile();
}
