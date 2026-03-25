import { writable } from 'svelte/store';
import { getContext } from 'svelte';

import { BigramGenerator } from './bigram';
import { tokensToNotes, notesToMidi } from './midiConverter';

export interface Generation {
  url: string;
  timestamp: string;
  params: {
    temperature: number;
    length: number;
    seed?: number;
  };
  noteCount: number;
}

export const generator = new BigramGenerator();

export const generations = writable<Array<Generation>>([]);

export async function generateMelody(params: any) {
  if (!generator.model || !generator.model.vocab) {
    throw new Error('Model not loaded');
  }  
  const tokens = generator.generate(params);
  
  const notes = tokensToNotes(tokens, generator.model!.vocab);
  const midiBlob = notesToMidi(notes);
  const url = URL.createObjectURL(midiBlob);

  const newGen: Generation = {
    url,
    timestamp: new Date().toISOString(),
    params,
    noteCount: notes.length
  };
  
  generations.update(g => [newGen, ...g]);
  return { url, notes };
}
