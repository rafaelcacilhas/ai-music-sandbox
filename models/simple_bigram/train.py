import json 
import numpy as np
from model import BigramMelodyModel
import os

def main():
    output_path = '../../data/models/bigram_model.json'
    data_path = "../../data/processed/training.json"

    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Run parser first.")
        return   
    with open(data_path,'r') as file:
        dataset = json.load(file)

    model = BigramMelodyModel()
    model.vocab = {int(k): v for k,v in dataset['vocab'].items()}

    print(f"Training on {len(dataset['sequences'])} sequences")

    model.train(dataset['sequences'])
    print(f"Attempting to save to: {output_path}")
    model.save(output_path)
    print(f"Model saved to {output_path}")

if __name__ == "__main__":
    main()