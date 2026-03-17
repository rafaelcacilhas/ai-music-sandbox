import {Note, ProcessedTrack, Pattern} from '../types';

export const groupNotesByTrack = (notes: Note[]):Map<number,Note[]> => {
    // Group notes by track index for multi-instrument pieces
    const trackMap = new Map<number,Note[]>();
    for (const note of notes){
        const noteTrack = note.track  || 0
        const trackNotes = trackMap.get(noteTrack)  || []
        trackNotes.push(note);
        trackMap.set(noteTrack, trackNotes)
    }
    return trackMap
}

export const quantizeNotes = (notes:Note[], resolution:number):Note[] =>{
    // Snap notes to a grid (e.g., 16th notes)
    // This makes patterns consistent for training
    return notes
}

export const detectTimeSignature = (notes:Note[] ): [number,number] => {
    // Guess time signature from note groupings
    // Default to 4/4 if can't detect
    return [4,4]
}

export const splitIntoPhrases = (notes:Note[], options:{
    minBars?:number,
    maxBars?:number,
    timeSignature:[number,number],
    ticksPerQuarter:number
}) : Note[][]  => { // [phrases][notes in the phrase]
    const {minBars, maxBars, timeSignature, ticksPerQuarter} = options
    const safeMinBars = minBars || 1
    const beatsPerBar = timeSignature[0]
    const ticksPerBar = ticksPerQuarter * beatsPerBar; // 1920 if 480 and 4/4

    const notesBarStart = notes.map((note) =>{
        return Math.floor(note.startTime / ticksPerBar)
    })

    const totalBars = Math.max(...notesBarStart);
    const phrasesCount = Math.ceil(totalBars/safeMinBars)
    
    const phrases: Note[][] = [];

    for (let i = 0; i < notes.length; i++){
        const barIndex = notesBarStart[i];
        const phraseIndex = Math.floor(barIndex/safeMinBars)
        if (!phrases[phraseIndex]) phrases[phraseIndex] = [];

        phrases[phraseIndex].push(notes[i])
    }
    return phrases
}

export const extractPatterns = (notes:Note[], options:{
    strategy: 'bars'| 'silence' | 'repetition',
    minBars?: number,
    maxBars?: number,
    timeSignature: [number, number],
    ticksPerQuarter: number
}): Pattern[] => {
    // High-level orchestration that uses the above functions
    return [{
        id: 'full-song',
        notes: [...notes].sort((a, b) => a.startTime - b.startTime),
        tempo: 120, 
        timeSignature: [4, 4],
        source: 'unknown',
        barCount: 1
    }];
}