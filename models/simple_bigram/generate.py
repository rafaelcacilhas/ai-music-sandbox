import json
import argparse
from model import BigramMelodyModel

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', default = '../../data/models/bigram_model.json')
    parser.add_argument('--seed', type=int, default=None)
    parser.add_argument('--length', type=int, default=50)
    parser.add_argument('--temperature', type=float, default=0.8)
    args = parser.parse_args()

    model = BigramMelodyModel()
    model.load(args.model)

    seed = args.seed if args.seed else model.reverse_vocab['<SOS>']
    generated = model.generate(seed, length = args.length, temperature = args.temperature)

    decoded = [model.vocab[id] for id in generated]
    print(' '.join(decoded))

if __name__ == "__main__":
    main()