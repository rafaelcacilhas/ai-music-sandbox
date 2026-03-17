import { groupNotesByTrack, splitIntoPhrases } from '../core/event-processor';
import { Note } from '../types';

const generateLongSequence = (barCount:number):Note[] => {
    const notes: Note[] = []
    const ticksPerQuarter = 480;
    const ticksPerBar = ticksPerQuarter * 4;

    for(let bar = 0; bar < barCount - 1; bar++){
        const barStart = bar*ticksPerBar;
        
        for(let beat = 1; beat <= 4; beat++){
            notes.push({
                pitch: 60 + bar*beat,
                velocity: 100,
                startTime: barStart + (beat*ticksPerQuarter),
                duration: ticksPerQuarter,
                track: 0
            })
        }
    }
    return notes
}

describe('splitIntoPhrases',() => {
    it('should split a long sequence into 4-bar phrases',() => {
        const numberOfBars = 16;
        const notes = generateLongSequence(numberOfBars);
        const options = {
            minBars:4,
            maxBars:4,
            timeSignature:[4,4] as [number, number],
            ticksPerQuarter: 480
        }

        const phrases = splitIntoPhrases(notes, options)
        expect(phrases.length).toBe(4); // 16 bars and 4 bar phrases - 4 phrases
        expect(phrases[0].length).toBeGreaterThan(0); 
    })
})

describe('groupNotesByTrack', () => {
    it('should group notes by track number', () => {
        const notes: Note[] = [
            { pitch: 60, velocity: 100, startTime: 0, duration: 480, track: 0 },
            { pitch: 64, velocity: 90, startTime: 0, duration: 480, track: 1 },
            { pitch: 67, velocity: 80, startTime: 480, duration: 480, track: 0 },
            { pitch: 72, velocity: 100, startTime: 480, duration: 480, track: 1 },
        ];

        const grouped = groupNotesByTrack(notes);
        expect(grouped.size).toBe(2);
        expect(grouped.get(0)).toHaveLength(2);
        expect(grouped.get(1)).toHaveLength(2);

        // Test that notes from one track are not on the other
        const track0Pitches = grouped.get(0)?.map(n => n.pitch) || [];
        expect(track0Pitches).not.toContain(64);
        expect(track0Pitches).not.toContain(72);

        const track1Pitches = grouped.get(1)?.map(n => n.pitch) || [];
        expect(track1Pitches).not.toContain(60);
        expect(track1Pitches).not.toContain(67);

    });

    it('should return empty map for empty input', () => {
        const grouped = groupNotesByTrack([]);
        expect(grouped.size).toBe(0);
    })
})