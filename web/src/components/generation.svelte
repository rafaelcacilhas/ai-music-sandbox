<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import {  generations, type Generation } from '$lib/music/generation';
	import { getOriginalNode } from 'typescript';
  
  const midiStore = getContext('midi') as Writable<{
    currentUrl: string;
    selectedGeneration: Generation | null;
    generations: any[];
    shouldStop: boolean;
  }>;

  function downloadMidi(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

</script>    

<div class="panel">
  <div class="logs-list">
    {#each $generations as gen, i}
        <div class="log-entry {$midiStore.selectedGeneration?.timestamp === gen.timestamp ? 'selected' : ''}">     
          <span class="log-params">Temp {gen.params.temperature.toFixed(1)} Length {gen.params.length}</span>

          <button 
              class="log-select"
              onclick={() => {
                $midiStore.shouldStop = true;
                $midiStore.selectedGeneration = gen
              }}
              aria-label={`Select generation from ${new Date(gen.timestamp).toLocaleTimeString()}`}
          >
              <span class="log-time">{gen.name}</span>
          </button>
          
          <button 
              class="log-download "
              onclick={(e) => { 
              e.stopPropagation(); 
              downloadMidi(gen.url, `melody_${gen.timestamp}.mid`);
              }}
              aria-label="Download MIDI"
          >
              download
          </button>
        </div>
    {/each}
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
    content: "// GENERATION LOGS";
    position: absolute;
    top: -0.6rem;
    left: 1rem;
    background: #0f1319;
    padding: 0 0.5rem;
    font-size: 0.7rem;
    color: var(--color-red);
    letter-spacing: 1px;
  }

  .logs-list{
    display:flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 2rem;
  }


  .log-entry {
    min-width:150px;
    min-height:120px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    border-radius: 15px;
    border: 2px solid var(--color-orange);
  }

  .log-select {
    padding: -2px;
    margin: -0.5rem 0;
    background: transparent;
    border: 0;

    flex: 1;
    min-height:100px;
    display: flex;
    justify-content: center;
    align-items: center;

    color: inherit;
    cursor: pointer;
    text-align: left;
    font-family: monospace;
        letter-spacing: 0;

  }


  .log-select:hover {
    background: #ff5e3a10;
  }

  .log-entry.selected .log-select {
    background: #ff5e3a20;
    border-left: 2px solid var(--color-orange);
  }

  .log-download {
    color: var(--color-orange);
    cursor: pointer;
    font-size: 0.75rem;
    letter-spacing: 0;

    border-radius: 10px;
    border: 0px solid var(--color-orange);

    margin:0;
    margin-top:-1.5rem;
    padding:5px;

  }

  .log-download:hover {
    color: #ff5e3a;
  }

  .log-time {
    margin: -0.2rem 0 0.5rem 0;
    border:2px solid var(--color-yellow);
    border-radius:10px;
    padding:0.2rem 0.5rem;
    font-family: monospace;
    color: var(--color-yellow);
    font-size: 1.4rem;
  }

  .log-params {
    width:100%;
    margin: 0;
    padding:0.5rem 0 0.25rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
    
    font-family: monospace;
    text-transform: uppercase;
    color: var(--color-green);
    font-size: 0.7rem;
    color: var(--color-orange);
    border-bottom: 2px solid var(--color-orange)
  }
</style>