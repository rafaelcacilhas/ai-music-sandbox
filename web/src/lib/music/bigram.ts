import modelData from './bigram_model.json';
import type { BigramModel, GenerationParams } from './types';

export class BigramGenerator {
  public model: BigramModel | null = null;
  private probabilities: Record<string, Record<string, number>> | null = null;

  constructor() {
      const counts = modelData.counts;
      this.probabilities = {};
      for (const [current, nextCounts] of Object.entries(counts)) {
        const total = Object.values(nextCounts).reduce((a, b) => a + b, 0);
        this.probabilities[current] = {};
        for (const [next, count] of Object.entries(nextCounts)) {
          this.probabilities[current][next] = count / total;
        }
      }
      
      this.model = {
        vocab: Object.fromEntries(
          Object.entries(modelData.vocab).map(([k, v]) => [parseInt(k), v as string])
        ),
        counts: modelData.counts
      };
    }
    


  async loadModel(url: string = '/bigram_model.json') {
    const response = await fetch(url);
    const data = await response.json();
        this.model = {
          counts: data.counts,
          vocab: Object.fromEntries(
            Object.entries(data.vocab).map(([k, v]) => [parseInt(k), v as string])
          )
        };
    
    this.probabilities = {};
    for (const [current, nextCounts] of Object.entries(this.model.counts)) {
      const total = Object.values(nextCounts).reduce((a, b) => a + b, 0);
      this.probabilities[current] = {};
      for (const [next, count] of Object.entries(nextCounts)) {
        this.probabilities[current][next] = count / total;
      }
    }
  }

  generate(params: GenerationParams): number[] {
    if (!this.model || !this.probabilities) throw new Error('Model not loaded');
    const { temperature, length, seed = 1 } = params;
    const tokens: number[] = [seed];
    let current = seed;
    
    for (let i = 0; i < length; i++) {
        const nextProbs = this.probabilities[current];
      if (!nextProbs) break;
      
      const nextTokens = Object.keys(nextProbs).map(Number);
      const probs = nextTokens.map(t => 
        Math.pow(nextProbs[t], 1 / temperature)
      );
      
      const sum = probs.reduce((a, b) => a + b, 0);
      const normalized = probs.map(p => p / sum);
      
      let random = Math.random();
      let accumulated = 0;
      let next = nextTokens[0];
      
      for (let j = 0; j < nextTokens.length; j++) {
        accumulated += normalized[j];
        if (random <= accumulated) {
          next = nextTokens[j];
          break;
        }
      }
      
      tokens.push(next);
      current = next;
      
      if (this.model.vocab[next] === '<EOS>') break;
    }
    
    return tokens;
  }
}