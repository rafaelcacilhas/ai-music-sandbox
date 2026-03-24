<script lang="ts">
  import { onMount } from 'svelte';
  import { isModelLoaded, generateMelody, generations, type Generation } from '$lib/music/generation';
  import MidiPlayer from '../components/player.svelte';
  
  let temperature = $state(0.9);
  let length = $state(100);
  let seedType = $state('note');
  let seedValue = $state(60);
  
  let selectedGeneration: Generation | null = $state(null);
  let midiUrl = $state('');
  let isGenerating = $state(false);
  let generationError = $state<string | null>(null);
  let generationCount = $state(0);
  let modelReady = $state(false);
  
  onMount(() => {
    const unsubscribe = isModelLoaded.subscribe(ready => {
      modelReady = ready;
    });
    return () => unsubscribe();
  });
  
  async function generateNewMelody() {
    isGenerating = true;
    generationError = null;
    let seed = seedValue + 3; // Convert NOTE_0 to token ID? Adjust based on your vocab
    
    try {
      const result = await generateMelody({ 
        temperature, 
        length,
        seed 
      });
      midiUrl = result.url;
      generationCount++;
    } catch (err: any) {
      generationError = err.message;
    } finally {
      isGenerating = false;
    }
  }
  
  function randomizeParams() {
    temperature = parseFloat((Math.random() * 1.9 + 0.1).toFixed(1));
    length = Math.floor(Math.random() * 180 + 20);
    const noteOptions = [48, 60, 72, 84]; // C3, C4, C5, C6
    seedValue = noteOptions[Math.floor(Math.random() * noteOptions.length)];
  }
  
  function downloadMidi(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

</script>

<section>
  <div class="terminal">
    <div class="header">
      <h1>◢ AI MUSIC LAB</h1>
      <h2>▷ SYSTEM STATUS: 
        <span class={modelReady ? 'status-active' : 'status-loading'}>
          {modelReady ? 'ACTIVE' : 'LOADING MODEL...'}
        </span> 
        | MELODY GENERATION ONLINE
      </h2>
    </div>

    <div class="content">
      <div class="panel">
        <div class="parameters">

          <div class="control-group">
            <div class="control-label">
              <h2>◢ TEMPERATURE (ENTROPY)</h2>
              <p class="value-display">{temperature.toFixed(1)}</p>
            </div>
            <input 
              type="range" 
              bind:value={temperature}
              min="0.1" 
              max="2.0" 
              step="0.1"
            />
          </div>

          <div class="control-group">
            <div class="control-label">
              <span>◢ SEQUENCE LENGTH (FRAMES)</span>
              <span class="value-display">{length}</span>
            </div>
            <input 
              type="range" 
              bind:value={length}
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
              bind:value={seedValue}
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
            disabled={isGenerating || !modelReady} 
            class="btn btn-primary"
          >
            {#if isGenerating}
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

        {#if generationError}
          <div class="error-box">
            <div class="error-title">ERROR</div>
            <div class="error-message">{generationError}</div>
          </div>
        {/if}

        {#if isGenerating}
        <div class="progress-container">
          <div class="progress-label">GENERATION IN PROGRESS</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 100%; animation: pulse 1s ease-in-out infinite;"></div>
          </div>
        </div>
        {/if}
      </div>

      <div class="player-section">
        <div class="player-header">
          <div><span class="status-led"></span> CURRENT GENERATION</div>
          <div class="generation-badge">#{generationCount}</div>
        </div>
        
        {#if midiUrl}
          <MidiPlayer midiUrl={midiUrl} />
          <div class="player-stats">
            <span>🎵 {length} tokens</span>
            <span>🌡️ temp {temperature.toFixed(1)}</span>
            <button 
              class="download-btn"
              onclick={() => downloadMidi(midiUrl, `melody_${Date.now()}.mid`)}
            >
              ⬇️ SAVE
            </button>
          </div>
        {:else}
          <div class="empty-player">
            <span class="status-waiting">○ NO GENERATION YET</span>
            <p>Click LAUNCH GENERATION to create a melody</p>
          </div>
        {/if}
      </div>

      <div class="nerv-panel">
        <div class="logs-panel">
          <div class="logs-header">◢ GENERATION LOGS</div>
          <div class="logs-list">
            {#each $generations as gen, i}
              <div 
                class="log-entry {selectedGeneration === gen ? 'selected' : ''}"
                onclick={() => selectedGeneration = gen}
              >
                <span class="log-time">{new Date(gen.timestamp).toLocaleTimeString()}</span>
                <span class="log-params">T:{gen.params.temperature.toFixed(1)} L:{gen.params.length}</span>
                <button 
                  class="log-download"
                  onclick={(e) => { e.stopPropagation(); downloadMidi(gen.url, `melody_${gen.timestamp}.mid`); }}
                >
                  ⬇️
                </button>
              </div>
            {/each}
            {#if $generations.length === 0}
              <div class="log-empty">No generations yet. Click LAUNCH to begin.</div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>◢ BIGRAM MODEL | TRAINED ON {modelReady ? 'CLASSICAL + GAME DATASET' : '...'}</div>
      <div>RAFAEL CACILHAS</div>
    </div>
  </div>
</section>

<style>
  section {
    background: #0a0c0f;
    color: #8f9bb3;
    padding: 2rem;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .terminal {
    max-width: 1000px;
    width: 100%;
    background: #11151c;
    border: 1px solid #2a2f3a;
    box-shadow: 0 0 20px rgba(255, 40, 40, 0.15);
    position: relative;
    overflow: hidden;
  }

  .header {
    background: #0b0e12;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid #ff3e3e;
    position: relative;
  }

  .header h1 {
    text-transform: uppercase;
    color: #ff3e3e;
    font-size: 1.8rem;
  }

  .header h2 {
    font-size: 0.8rem;
    font-weight: normal;
    margin-top: 0.5rem;
  }

  .header::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 30%;
    height: 2px;
    background: #ff3e3e;
  }

  .content {
    padding: 2rem;
  }

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
    color: #ff3e3e;
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
    background: #ff3e3e;
    cursor: pointer;
  }

  .value-display {
    color: #ff3e3e;
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
    background: #ff3e3e20;
    border-color: #ff3e3e;
    color: #ff3e3e;
  }

  .btn-primary:hover:not(:disabled) {
    background: #ff3e3e40;
  }

  .btn-secondary:hover {
    background: #2a2f3a;
  }

  .btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .player-section {
    background: #0b0e12;
    border: 1px solid #2a2f3a;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .player-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 0.7rem;
  }

  .generation-badge {
    color: #ff8c42;
    font-family: monospace;
  }

  .player-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 0.75rem;
    font-size: 0.7rem;
    color: #5ac45a;
  }

  .download-btn {
    background: transparent;
    border: none;
    color: #ff8c42;
    cursor: pointer;
    font-size: 0.7rem;
  }

  .empty-player {
    text-align: center;
    padding: 2rem;
    color: #5a6b8c;
  }

  .status-waiting {
    font-size: 0.8rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .status-led {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #5ac45a;
    margin-right: 6px;
    animation: pulse 1.5s infinite;
  }

  .status-active {
    color: #5ac45a;
  }

  .status-loading {
    color: #ff8c42;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
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
  }

  .progress-label {
    font-size: 0.6rem;
    color: #ff8c42;
    margin-bottom: 0.25rem;
  }

  .progress-bar {
    width: 100%;
    height: 2px;
    background: #2a2f3a;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff8c42, #ff3e3e);
    animation: pulse 1s ease-in-out infinite;
  }

  .logs-panel {
    background: #0a0c10;
    border: 1px solid #2a2f3a;
    border-left: 3px solid #ff8c42;
    height: 300px;
    overflow-y: auto;
  }

  .log-entry {
    padding: 0.75rem;
    border-bottom: 1px solid #1a1f2a;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .log-entry:hover {
    background: #ff5e3a10;
  }

  .log-entry.selected {
    background: #ff5e3a20;
    border-left: 2px solid #ff8c42;
  }

  .log-time {
    font-family: monospace;
    color: #ff8c42;
    font-size: 0.7rem;
  }

  .log-params {
    font-family: monospace;
    color: #5ac45a;
    font-size: 0.7rem;
  }

  .log-download {
    background: transparent;
    border: none;
    color: #ff8c42;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .log-empty {
    padding: 2rem;
    text-align: center;
    color: #5a6b8c;
    font-size: 0.7rem;
  }

  .logs-header {
    padding: 0.5rem 0.75rem;
    background: #0b0e12;
    border-bottom: 1px solid #2a2f3a;
    color: #ff8c42;
    font-size: 0.7rem;
    letter-spacing: 2px;
  }

  .footer {
    border-top: 1px solid #1e232c;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    font-size: 0.6rem;
    color: #5a6b8c;
    font-family: monospace;
  }
</style>