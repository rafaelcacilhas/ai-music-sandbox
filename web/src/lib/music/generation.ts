import { writable } from 'svelte/store';
import { getContext } from 'svelte';

import { BigramGenerator } from './bigram';
import { tokensToNotes, notesToMidi } from './midiConverter';

export interface Generation {
  name:string;
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

export async function generateMelody(params: any):Promise<Generation> {
  if (!generator.model || !generator.model.vocab) {
    throw new Error('Model not loaded');
  }  
  const tokens = generator.generate(params);
  
  const name = getGenerationName();
  const notes = tokensToNotes(tokens, generator.model!.vocab);
  const midiBlob = notesToMidi(notes);
  const url = URL.createObjectURL(midiBlob);

  const newGen: Generation = {
    name,
    url,
    timestamp: new Date().toISOString(),
    params,
    noteCount: notes.length
  };
  
  generations.update(g => [newGen, ...g]);
  return newGen;
}

let nameUsage: Record<string, number> = {};

const angelNames = ['SACHIEL', 'SAMSOM', 'RAMIEL', 'GAGHIEL', 'ISHMAEL', 'MATARAEL', 'SAHAQUIEL', 'IRUEL', 'LELIEL', 'LILITH', 'BARDIEL', 'ZERUEL', 'ARAEL', 'TABRIS'];

function getGenerationName(): string {
  const randomIndex = Math.floor(Math.random() * angelNames.length);
  const angel = angelNames[randomIndex];
  const count = nameUsage[angel] || 0;

  if (count === 0) {
      nameUsage[angel] = 1;
      return angel;
  } else {
      nameUsage[angel] = count + 1;
      return  `${angel}_${count + 1}`;
  }

}