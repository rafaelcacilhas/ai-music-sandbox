<script lang="ts">
    import modelData from '../lib/music/bigram_model.json';
    import { generateMelody } from '$lib/music/generation';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
	import LoadingBar from './loadingBar.svelte';
    import { type Generation } from '$lib/music/generation';
    
    const generationStore = getContext('generation') as Writable<{
        temperature: number;
        length: number;
        seedValue: number;
        isGenerating: boolean;
        generationError: string | null;
        generationCount: number;
        modelReady: boolean;
    }>;

    const midiStore = getContext('midi') as Writable<{
        currentUrl: string;
        selectedGeneration: Generation | null;
        generations: any[];
        shouldStop: boolean;
        isPlaying: boolean;
        playerRef:any;
    }>;

    async function generateNewMelody() {
        if($midiStore.playerRef && $midiStore.isPlaying ){
            $midiStore.playerRef.stopPlayback();
        }
        $generationStore.isGenerating = true
        $generationStore.generationError = null
        
        const noteToken = `NOTE_${$generationStore.seedValue}`;
        const entry = Object.entries(modelData.vocab).find(([_, v]) => v === noteToken);
        const seed = entry ? parseInt(entry[0]) : undefined;
        if(!seed)   console.error("Seed not found", $generationStore.seedValue )
        
        try {
            const result = await generateMelody({ 
                temperature:$generationStore.temperature, 
                length:$generationStore.length, 
                seed: seed 
            });

            const generation:Generation = {
                name:result.name,
                url: result.url,
                timestamp: new Date().toISOString(),
                params: {
                    temperature: $generationStore.temperature,
                    length: $generationStore.length,
                    seed: seed
                },
                noteCount: result.noteCount
            }

            $midiStore = {
                ...$midiStore,
                currentUrl: result.url,
                selectedGeneration: generation,
                generations: [generation, ...$midiStore.generations]
            };

            $generationStore.generationCount++;
        } catch (err: any) {
            $generationStore.generationError = err.message;
        } finally {
            setTimeout(() => {
                $generationStore.isGenerating = false;
            }, 500);
        }
    }
    
    function randomizeParams() {
        $generationStore = {
            ...$generationStore,
            temperature: parseFloat((Math.random() * 1.9 + 0.1).toFixed(1)),
            length: Math.floor(Math.random() * 180 + 20),
            seedValue: [48, 60, 72, 84][Math.floor(Math.random() * 4)]
        };
    }
</script>

<div class="panel">
    <div class="parameters">

        <div class="control-group">
        <div class="control-label">
            <h2>◢ TEMPERATURE (ENTROPY)</h2>
            <p class="value-display">{$generationStore.temperature.toFixed(1)}</p>
        </div>
        <input 
            type="range" 
            bind:value={$generationStore.temperature}
            min="0.1" 
            max="2.0" 
            step="0.1"
        />
        </div>

        <div class="control-group">
        <div class="control-label">
            <span>◢ SEQUENCE LENGTH (FRAMES)</span>
            <span class="value-display">{$generationStore.length}</span>
        </div>
        <input 
            type="range" 
            bind:value={$generationStore.length}
            min="20" 
            max="200" 
            step="10"
        />
        </div>
    </div>

    <div class="control-group">
        <div class="control-label">◢ SEED</div>
        <div class="control-group seed-input">
        <input 
            type="number" 
            bind:value={$generationStore.seedValue}
            min="0" 
            max="127" 
            placeholder="NOTE #"
        />
        <span class="note-hint">(MIDI note 0-127)</span>
        </div>
    </div>

    <div class="button-group">
        <button 
        onclick={generateNewMelody}  
        disabled={$generationStore.isGenerating || !$generationStore.modelReady} 
        class="btn btn-primary"
        >
        {#if $generationStore.isGenerating}
            ◢ GENERATING...
        {:else}
            ◢ LAUNCH GENERATION
        {/if}
        </button>
        <button 
        onclick={randomizeParams} 
        class="btn btn-secondary"
        >
        ◢ RANDOMIZE
        </button>
    </div>

    {#if $generationStore.generationError}
        <div class="error-box">
        <div class="error-title">ERROR</div>
        <div class="error-message">{$generationStore.generationError}</div>
        </div>
    {/if}

    <div class="progress-container">
        {#if $generationStore.isGenerating}
            <div class="progress-label">GENERATION IN PROGRESS</div>
            <div class="progress-bar">
                <LoadingBar trigger={true} segmentCount={24}/>
            </div>
        {/if}
    </div>

</div>

<style>
  .panel {
  background: #0f1319;
  border: 1px solid #232833;
  margin-bottom: 2rem;
  padding: 1.5rem;
  position: relative;
  }

  .panel::before {
  content: "// CONTROL";
  position: absolute;
  top: -0.6rem;
  left: 1rem;
  background: #0f1319;
  padding: 0 0.5rem;
  font-size: 0.7rem;
  color: var(--color-red);
  letter-spacing: 1px;
  }

  .control-group {
  margin-bottom: 1.5rem;
  }

  .parameters{
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 2rem;
  }

  .control-label {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  }

  input[type="range"] {
  width: 100%;
  height: 3px;
  background: #2a2f3a;
  appearance: none;
  -webkit-appearance: none;
  }

  input[type="range"]:focus {
  outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: var(--color-red);
  cursor: pointer;
  }

  .value-display {
  color: var(--color-red);
  font-size: 0.9rem;
  }

  .seed-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  }

  .seed-input input {
  width: 120px;
  text-align: center;
  }

  .note-hint {
  font-size: 0.65rem;
  color: #5a6b8c;
  }

  .button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  }

  .btn {
  flex: 1;
  background: transparent;
  border: 1px solid #2a2f3a;
  padding: 0.75rem;
  font-family: monospace;
  font-size: 0.8rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  color: #b0bed9;
  }

  .btn-primary {
  background: var(--color-red)20;
  border-color: var(--color-red);
  color: var(--color-red);
  }

  .btn-primary:hover:not(:disabled) {
  background: var(--color-red)40;
  }

  .btn-secondary:hover {
  background: #2a2f3a;
  }

  .btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  }
  .error-box {
    background: #aa2e1e20;
    border: 1px solid #aa2e1e;
    padding: 0.75rem;
    margin-top: 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .error-title {
    color: #aa2e1e;
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 0rem;
  }

  .error-message {
    font-size: 0.7rem;
    color: #aa2e1e;
  }

  .progress-container {
    margin-top: 1rem;
    min-height:1.5rem;
    display:flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .progress-label {
    font-size: 0.6rem;
    color: var(--color-orange);
    margin-bottom: 0.25rem;
  }
  .progress-bar {
    width: 100%;
    height: 2px;
    transform-origin: top left;
    transform: translateX(-20%);
  }
</style>