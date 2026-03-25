import * as ToneMidi from '@tonejs/midi';
import type { Note } from './types';

export function tokensToNotes(tokens: number[], vocab: Record<number, string>): Note[] {
  if (!vocab) {
    console.error('Vocab is undefined');
    return [];
  }

  if (!tokens || tokens.length === 0) {
    return [];
  }

  const notes: Note[] = [];
  let currentTime = 0;
  let i = 0;
  
  while (i < tokens.length - 1) {
    const tokenStr = vocab[tokens[i]];
    const nextStr = vocab[tokens[i + 1]];
    
    if (tokenStr?.startsWith('NOTE_') && nextStr?.startsWith('DUR_')) {
      const pitch = parseInt(tokenStr.split('_')[1]);
      const duration = parseInt(nextStr.split('_')[1]);
      
      notes.push({
        pitch,
        duration: duration / 480, // Convert ticks to quarter notes
        velocity: 100
      });
      
      currentTime += duration;
      i += 2;
    } else {
      i++;
    }
  }
  
  return notes;
}

export function notesToMidi(notes: Note[], tempo: number = 120): Blob {
  if (!notes || notes.length === 0) {
    console.warn('No notes to convert');
    return new Blob([], { type: 'audio/midi' });
  }

  try {
    const midi = new ToneMidi.Midi();
    const track = midi.addTrack();
    let currentTime = 0;
    
    notes.forEach(note => {
      track.addNote({
        midi: note.pitch,
        time: currentTime,
        duration: note.duration,
        velocity: note.velocity
      });
      currentTime += note.duration;
    });
    
    const midiArray = midi.toArray() as unknown as BlobPart
    return new Blob([midiArray], { type: 'audio/midi' });
  } catch(err:any){
    console.error("Error creating MIDI:", err)
    return new Blob([],{type: 'audio/midi'})
  }
}