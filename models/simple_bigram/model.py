import numpy as np # pyright: ignore[reportMissingImports]
from collections import defaultdict
import json
import os

class BigramMelodyModel:
    """
    Simple melody generator: predicts next token based on current token.
    """

    def __init__(self):
        self.counts = defaultdict(lambda:defaultdict(int))
        self.vocab_size = 0
        self.vocab = {}             # id -> token string
        self.reverse_vocab = {}     # token string -> id

    def train(self,sequences):
        """
        sequences: list of lists of token IDs
        Example:: [[1,50,22],[1, 85, 284]]
        """
        for sequency in sequences:
            for i in range(len(sequency)-1):
                current_token = sequency[i]
                next_token = sequency[i+1]
                self.counts[current_token][next_token] += 1

        # Convert counts to probabilities
        self.probabilities = {}
        for current_token, next_counts in self.counts.items():
            total = sum(next_counts.values())
            self.probabilities[current_token] = {
                token: count / total
                for token, count in next_counts.items()
            }

        print(f"Trained on {len(sequences)} sequences")
        print(f"Found {len(self.counts)} unique current tokens")

    def generate(self, seed_token, length=10, temperature=1.0):
        """
        Generate a sequence starting from seed_token
        """

        if seed_token not in self.probabilities:
            raise ValueError(f"Seed token {seed_token} not seen in training")
        
        generated = [int(seed_token)]
        current = int(seed_token) 

        for _ in range(length):
            if current not in self.probabilities:
                break;  # no training data for this token
            
            next_probs = self.probabilities[current]

            if temperature != 1.0:  # Apply heat to next_probs
                next_probs = {
                    token: prob**(1/temperature)
                    for token, prob in next_probs.items()
                }
                total = sum(next_probs.values())
                next_probs = {
                    token: prob/total
                    for token, prob in next_probs.items()
                }

            tokens_list = list(next_probs.keys())
            tokens = [int(t) for t in tokens_list]
            probs = list(next_probs.values())
            
            next_token = np.random.choice(tokens, p=probs)
            next_token = int(next_token)

            generated.append(next_token)
            current = next_token

            if self.reverse_vocab and current == self.reverse_vocab.get('<EOS>'):
                break

        return generated

    def save(self, path):
        """Save model to file"""

        directory = os.path.dirname(path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

        model_data = {
            'counts': {str(k): dict(v) for k,v in self.counts.items()},
            'vocab': self.vocab,
            'reverse_vocab': self.reverse_vocab
        }
        with open(path,'w') as file:
            json.dump(model_data, file)
        
    def load(self, path):
        """ Load from file """
        with open(path, 'r') as file:
            model_data = json.load(file)
        
        self.counts = {int(k): defaultdict(int,v) for k,v in model_data['counts'].items()}
        self.vocab = {int(k): v for k, v in model_data['vocab'].items()}
        self.reverse_vocab = {v: int(k) for k, v in self.vocab.items()}

        for curr_str, next_dict in model_data.get('counts', {}).items():
            curr = int(curr_str)
            self.counts[curr] = defaultdict(int)
            for next_str, cnt in next_dict.items():
                nxt = int(next_str)
                self.counts[curr][nxt] = cnt
 
        self.probabilities = {}
        for current_token, next_counts in self.counts.items():
            total = sum(next_counts.values())
            self.probabilities[current_token] = {
                token: count / total
                for token, count in next_counts.items()
            }
