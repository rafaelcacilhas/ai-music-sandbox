import json
import argparse
import numpy as np
import pretty_midi
from model import BigramMelodyModel

def tokens_to_notes(tokens, vocab):
    """
    Convert a list of token IDs into a list of (pitch, duration, start_time) notes.
    Assumes token sequence: <SOS>? (NOTE, DUR) repeated, maybe <EOS>.
    """
    notes = []
    current_time = 0
    i = 0
    
    # Skip <SOS> if present
    if len(tokens) > 0 and vocab.get(tokens[0]) == '<SOS>':
        i = 1
    
    while i < len(tokens) - 1:
        token_id = tokens[i]
        next_id = tokens[i+1]
        
        token_str = vocab.get(token_id, '')
        next_str = vocab.get(next_id, '')
        
        if token_str.startswith('NOTE_') and next_str.startswith('DUR_'):
            pitch = int(token_str.split('_')[1])
            duration = int(next_str.split('_')[1])
            
            notes.append({
                'pitch': pitch,
                'start': current_time,
                'duration': duration,
                'velocity': 100
            })
            
            current_time += duration
            i += 2  
        else:
            i += 1
    
    return notes

def create_midi_from_notes(notes, output_path, tempo=120):
    """
    Create a MIDI file from a list of notes using pretty_midi.
    """
    midi = pretty_midi.PrettyMIDI(initial_tempo=tempo)
    piano = pretty_midi.Instrument(program=0)
    
    ticks_per_quarter = 480
    seconds_per_tick = 0.5 / ticks_per_quarter
    
    for note_data in notes:
        start_time = note_data['start'] * seconds_per_tick
        end_time = start_time + (note_data['duration'] * seconds_per_tick)
        
        note = pretty_midi.Note(
            velocity=note_data['velocity'],
            pitch=note_data['pitch'],
            start=start_time,
            end=end_time
        )
        piano.notes.append(note)
    
    midi.instruments.append(piano)
    
    midi.write(output_path)
    print(f"MIDI file saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Generate a melody using a trained bigram model')
    parser.add_argument('--model', default='../../data/models/bigram_model.json',
                       help='Path to the trained model JSON file')
    parser.add_argument('--seed', type=int, default=None,
                       help='Seed token ID to start generation (default: <SOS> token)')
    parser.add_argument('--length', type=int, default=100,
                       help='Number of tokens to generate')
    parser.add_argument('--temperature', type=float, default=0.9,
                       help='Sampling temperature (higher = more random)')
    parser.add_argument('--output', default='generated.mid',
                       help='Output MIDI file path')
    
    args = parser.parse_args()

    print(f"Loading model from: {args.model}")
    model = BigramMelodyModel()
    model.load(args.model)

    seed = args.seed
    if seed is None:
        seed = 1        # Use <SOS> token (ID 1)

    tokens = model.generate(seed_token=seed, length=args.length, temperature=args.temperature)
    print(f"Generated {len(tokens)} tokens")
    print(f"First 20 tokens: {tokens[:20]}")

    decoded = [model.vocab.get(t, f"UNK_{t}") for t in tokens[:20]]
    print(f"Decoded: {decoded}")

    notes = tokens_to_notes(tokens, model.vocab)
    print(f"Number of valid note pairs found: {len(notes)}")

    if not notes:
        print("No notes generated.")
        return

    print(f"Generated {len(notes)} notes.")
    
    print("\nSample of generated notes (first 5):")
    for i, note in enumerate(notes[:5]):
        print(f"  Note {i}: pitch={note['pitch']}, start={note['start']}, duration={note['duration']}")

    create_midi_from_notes(notes, args.output)
    
    token_output = args.output.replace('.mid', '_tokens.json')
    with open(token_output, 'w') as f:
        json.dump({
            'tokens': tokens,
            'decoded': [model.vocab.get(t, f"UNK_{t}") for t in tokens]
        }, f, indent=2)
    print(f"Token sequence saved to {token_output}")

if __name__ == '__main__':
    main()