import { writable } from 'svelte/store';

export const generationStore = writable({
  temperature: 0.9,
  length: 100,
  seedValue: 60,
  isGenerating: false,
  generationError: null as string | null,
  generationCount: 0,
  modelReady: true,
});

export const midiStore = writable({
  currentUrl: '',
  selectedGeneration: null as any,
  generations: [] as any[],
  shouldStop: false,
  playerRef: {} as any
});