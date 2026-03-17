import { MusicTokenizer } from '../core/tokenizer';
import { Pattern, Note } from '../types';

describe('MusicTokenizer', ()=>{
    const createTestPattern = (notes: Partial<Note>[]): Pattern => ({
        id: 'test',
        notes: notes.map(n => ({
        pitch: n.pitch || 60,
        velocity: n.velocity || 100,
        startTime: n.startTime || 0,
        duration: n.duration || 480,
        track: n.track || 0
        })),
        tempo: 120,
        timeSignature: [4, 4],
        source: 'test',
        barCount: 1
    });

    it('should encode a single note pattern with SOS and EOS', ()=>{
        const tokenizer = new MusicTokenizer();
        const pattern = createTestPattern([{pitch:60, duration:480}]);

        tokenizer.fit([pattern]);
        const tokens = tokenizer.encode(pattern);

        // Should be: [SOS,NOTE_60,DUR_480,EOS]
        expect(tokens).toHaveLength(4);
        expect(tokenizer.decode(tokens)).toHaveLength(1);
    })

    it('should maintain note order when encoding', () => {
        const tokenizer = new MusicTokenizer();
        const pattern = createTestPattern([
        { pitch: 60, startTime: 480, duration: 240 }, // Second
        { pitch: 64, startTime: 0, duration: 480 }    // First
        ]);
        
        tokenizer.fit([pattern]);
        const tokens = tokenizer.encode(pattern);
        const decoded = tokenizer.decode(tokens);
        
        expect(decoded[0].pitch).toBe(64);
        expect(decoded[1].pitch).toBe(60);
    });

    it('should build vocabulary from multiple patterns', () => {
        const tokenizer = new MusicTokenizer();
        const pattern1 = createTestPattern([{ pitch: 60, duration: 480 }]);
        const pattern2 = createTestPattern([{ pitch: 62, duration: 240 }]);
        
        tokenizer.fit([pattern1, pattern2]);
        const vocab = tokenizer.exportVocab();
        
        // Should have specials + notes + durations
        expect(Object.keys(vocab).length).toBeGreaterThanOrEqual(5); // PAD,SOS,EOS,NOTE_60,DUR_480,NOTE_62,DUR_240
    });
})