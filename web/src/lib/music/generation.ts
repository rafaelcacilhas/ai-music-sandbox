import { writable } from 'svelte/store';
import { BigramGenerator } from './bigram';
import { tokensToNotes, notesToMidi } from './midiConverter';

export const generator = new BigramGenerator();
export const isModelLoaded = writable(false);

export const generations = writable<Array<{ url: string; timestamp: string; params: any }>>([]);
isModelLoaded.set(true);

export async function generateMelody(params: any) {
  const tokens = generator.generate(params);
  const notes = tokensToNotes(tokens, generator.model!.vocab);
  const midiBlob = notesToMidi(notes);
  
  const url = URL.createObjectURL(midiBlob);
  const timestamp = new Date().toISOString();
  
  generations.update(g => [{ url, timestamp, params }, ...g]);
  
  return { url, notes };
}

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