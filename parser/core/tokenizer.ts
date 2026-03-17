import {Pattern, Note} from '../types'

export interface Vocabulary {
    tokenToId: Map<string,number>;
    idToToken: Map<number,string>;
}

export class MusicTokenizer{
    private vocab: Vocabulary;
    private nextId: number = 0;

    constructor(){
        this.vocab = {
            tokenToId: new Map(),
            idToToken: new Map()
        }

        this.addToken('<PAD>');
        this.addToken('<SOS>');
        this.addToken('<EOS>');
    }

    private addToken(token:string):number {
        if(this.vocab.tokenToId.has(token)) return this.vocab.tokenToId.get(token)!;

        const id = this.nextId++;
        this.vocab.tokenToId.set(token,id);
        this.vocab.idToToken.set(id,token);
        return id;
    }

    fit(patterns:Pattern[]) :void {
        for (const pattern of patterns){
            for(const note of pattern.notes){
                this.addToken(this.noteToToken(note));
                this.addToken(this.durationToToken(note));
            }
        }
    }

    encode(pattern:Pattern):number[]{
        const tokens:number[] = [this.vocab.tokenToId.get('<SOS>')!];
        const sortedNotes = [...pattern.notes].sort((a,b) => a.startTime - b.startTime);

        for(const note of sortedNotes){
            tokens.push(this.vocab.tokenToId.get(this.noteToToken(note))!);
            tokens.push(this.vocab.tokenToId.get(this.durationToToken(note))!);
        }

        tokens.push(this.vocab.tokenToId.get('<EOS>')!);
        return tokens
    }

    decode(tokens:number[]):Note[] {
        const notes:Note[] = []
        
        let i = tokens[0] === this.vocab.tokenToId.get('<SOS>')? 1:0;
        while(i < tokens.length - 1){
            const pitchToken = this.vocab.idToToken.get(tokens[i]);
            const durToken = this.vocab.idToToken.get(tokens[i+1]);
            if(!pitchToken || !durToken) break;

            const pitch = this.tokenToPitch(pitchToken);
            const duration = this.tokenToDuration(durToken);
            if(pitch === null || duration === null) break;

            notes.push({
                pitch,
                duration,
                velocity: 100,  // default
                startTime: 0,   // placeholder
                track:0
            });

            i+=2;
        }

        return notes
    }

    exportVocab():Record<number,string>{
        const obj: Record<number, string> = {};
        for(    const[id,token] of this.vocab.idToToken.entries()){
            obj[id] = token;

        }
        return obj
    }

    private noteToToken(note:Note):string{
        return `NOTE_${note.pitch}`
    }

    private durationToToken(note:Note):string{
        return `DUR_${note.duration}`
    }

    private tokenToPitch(token:string): number | null {
        const match = token.match(/^NOTE_(\d+)$/);
        return match? parseInt(match[1], 10):null;
    }

    private tokenToDuration(token:string): number | null {
        const match = token.match(/^DUR_(\d+)$/);
        return match? parseInt(match[1], 10):null;
    }

}