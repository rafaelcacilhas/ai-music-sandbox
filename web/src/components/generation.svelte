<script lang="ts">
  import {  generations, type Generation } from '$lib/music/generation';

  let selectedGeneration: Generation | null = $state(null);

  function downloadMidi(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

</script>    

<div class="genaration-panel">
<div class="logs-panel">
<div class="logs-header">◢ GENERATION LOGS</div>
    <div class="logs-list">
    {#each $generations as gen, i}
        <div class="log-entry {selectedGeneration?.timestamp === gen.timestamp ? 'selected' : ''}">
        <button 
            class="log-select"
            onclick={() => {
            selectedGeneration = gen
            }}
            aria-label={`Select generation from ${new Date(gen.timestamp).toLocaleTimeString()}`}
        >
            <span class="log-time">{new Date(gen.timestamp).toLocaleTimeString()}</span>
            <span class="log-params">T:{gen.params.temperature.toFixed(1)} L:{gen.params.length}</span>
        </button>
        <button 
            class="log-download "
            onclick={(e) => { 
            e.stopPropagation(); 
            downloadMidi(gen.url, `melody_${gen.timestamp}.mid`);
            }}
            aria-label="Download MIDI"
        >
            ⬇️
        </button>
        </div>
    {/each}
    </div>
</div>
</div>


<style>  
  .logs-panel {
    background: #0a0c10;
    border: 1px solid #2a2f3a;
    border-left: 3px solid #ff8c42;
    height: 300px;
    overflow-y: auto;
  }

  .log-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #1a1f2a;
  }

  .log-select {
    flex: 1;
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    text-align: left;
    font-family: monospace;
  }

  .log-select:hover {
    background: #ff5e3a10;
  }

  .log-entry.selected .log-select {
    background: #ff5e3a20;
    border-left: 2px solid #ff8c42;
  }

  .log-download {
    max-width:50px;
    border: none;
    color: #ff8c42;
    cursor: pointer;
    padding: 0.75rem;
    font-size: 1rem;
    margin-right: 0.25rem;
  }

  .log-download:hover {
    color: #ff5e3a;
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

  .logs-header {
    padding: 0.5rem 0.75rem;
    background: #0b0e12;
    border-bottom: 1px solid #2a2f3a;
    color: #ff8c42;
    font-size: 0.7rem;
    letter-spacing: 2px;
  }
</style>