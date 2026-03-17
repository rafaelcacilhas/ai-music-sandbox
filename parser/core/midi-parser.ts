import { MidiData, parseMidi  } from 'midi-file';
import { readFileSync } from 'fs';
import { Note } from '../types';

export function loadMidiFile(filePath: string):MidiData{
    const input = readFileSync(filePath);
    const parsed = parseMidi(input);
    return parsed;
}

export function extractNotes(midiData:MidiData) : Note[]{
    const notes: Note[] = []
    const ticksPerQuarter = midiData.header.ticksPerBeat
    
    // Proccess each track
    for (const track of midiData.tracks){
        let absoluteTime = 0;
        const activeNotes = new Map();

        for(const event of track){
            absoluteTime += event.deltaTime

            if(event.type ==='noteOn' && event.velocity > 0){
                activeNotes.set(event.noteNumber,{
                    startTime: absoluteTime,
                    velocity: event.velocity
                })
            } 
            else if(event.type ==='noteOff' || event.type ==='noteOn' && event.velocity === 0){
                const noteOn = activeNotes.get(event.noteNumber);
                if(noteOn){
                    notes.push({
                        pitch: event.noteNumber,
                        velocity: noteOn.velocity,
                        startTime: noteOn.startTime,
                        duration: absoluteTime - noteOn.startTime,
                        track: midiData.tracks.indexOf(track)   
                    })
                    activeNotes.delete(event.noteNumber);
                }
            } 
        }
    }

    return notes
}

 
