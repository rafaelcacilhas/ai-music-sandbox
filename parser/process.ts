import fg from 'fast-glob';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { loadMidiFile, extractNotes } from './core/midi-parser.js';
import { extractPatterns, groupNotesByTrack } from './core/event-processor.js';
import { MusicTokenizer } from './core/tokenizer.js';
import { exportTrainingData } from './export.js';
import { Pattern } from './types';

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function findMidiFiles(dir: string): string[] {
  const results: string[] = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      results.push(...findMidiFiles(fullPath));
    } else if (item.toLowerCase().endsWith('.mid') || item.toLowerCase().endsWith('.midi')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

interface ProcessOptions {
  inputDir: string;
  outputFile: string;
  patternsPerTrack?: boolean; 
}

async function processDataset(options: ProcessOptions) {
    console.log(`Processing MIDI files from ${options.inputDir}...`);
    
    const files =  findMidiFiles(options.inputDir);
    
    console.log(`Found ${files.length} MIDI files`);
    if (files.length === 0) {
        console.log('No MIDI files found. Please add some .mid files to the dataset folder.');
        return;
    }

    const allPatterns: Pattern[] = [];
    const tokenizer = new MusicTokenizer();

    for(const file of files){
        try{
            console.log(`Processing ${file}...`);
            
            const midiData = loadMidiFile(file);
            
            const notes = extractNotes(midiData);
            console.log(`Extracted ${notes.length} notes`);
            
            if (notes.length === 0) continue;


            if (options.patternsPerTrack) {
                    const trackGroups = groupNotesByTrack(notes);
                    console.log(`  Grouped into ${trackGroups.size} tracks`);
                    
                    for (const [trackId, trackNotes] of trackGroups) {
                    const patterns = extractPatterns(trackNotes, {
                        strategy: 'bars',
                        timeSignature: [4, 4],
                        ticksPerQuarter: midiData.header.ticksPerBeat || 480
                    });
                    
                    patterns.forEach(p => {
                        p.source = `${file}:track${trackId}`;
                    });
                    
                    allPatterns.push(...patterns);
                    console.log(`Track ${trackId}: ${patterns.length} patterns`);
                    }
                } else {
                    const patterns = extractPatterns(notes, {
                    strategy: 'bars',
                    timeSignature: [4, 4],
                    ticksPerQuarter: midiData.header.ticksPerBeat || 480
                    });
                    
                    patterns.forEach(p => {
                    p.source = file;
                    });
                    
                    allPatterns.push(...patterns);
                    console.log(`Extracted ${patterns.length} patterns`);
                }
        }
        catch(error){
            console.error(`Error processing ${file}:`, error);
        }
    }
    console.log(`Extracted ${allPatterns.length} patterns`);

    tokenizer.fit(allPatterns);
    const sequences = allPatterns.map(p => tokenizer.encode(p));

    const dataset = {
        vocab: tokenizer.exportVocab(),
        sequences: sequences,
        stats: {
        totalPatterns: allPatterns.length,
        totalTokens: sequences.flat().length,
        vocabSize: Object.keys(tokenizer.exportVocab()).length,
        maxSequenceLength: Math.max(...sequences.map(s => s.length)),
        minSequenceLength: Math.min(...sequences.map(s => s.length))
        }
    };

    exportTrainingData(dataset, options.outputFile);
    console.log(`Dataset saved to ${options.outputFile}`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

const inputDir =  resolve(__dirname, '../dataset');
const outputFile = resolve(__dirname, '../data/processed/training.json');

console.log('__dirname: ', __dirname);
console.log('inputDir: ', inputDir);
console.log('outputFile: ', outputFile);


console.log('Looking for MIDI files in:', inputDir);
const { existsSync } = await import('fs');
if (!existsSync(inputDir)) {
    console.error(`ERROR: Directory ${inputDir} does not exist!`);
}

const patternsPerTrack = args.includes('--per-track');
console.log('Starting process with:');
console.log('- inputDir:', inputDir);
console.log('- outputFile:', outputFile);
console.log('- patternsPerTrack:', patternsPerTrack);

processDataset({ inputDir, outputFile, patternsPerTrack }).catch(console.error);


export { processDataset };