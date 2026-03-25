<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import * as Tone from 'tone';
  import * as ToneMidi from '@tonejs/midi';
  const { Midi } = ToneMidi;

  const midiStore = getContext('midi') as Writable<{
    currentUrl: string;
    selectedGeneration: any;
    generations: any[];
  }>;

  const generationStore = getContext('generation') as Writable<{
      generationCount: number;
  }>;
  
  let isPlaying = $state(false);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let duration = $state(0);
  let synth: Tone.PolySynth = $state({} as Tone.PolySynth);
  let midiData: any = $state(null);
  let stopTimeout: ReturnType<typeof setTimeout> | null = $state(null);
  let scheduledEvents: Array<{ time: number; note: any }> = $state([]);
  
  $effect(() => {
    const selected = $midiStore.selectedGeneration;
    if (selected?.url) loadMidi();
  });
  
  async function loadMidi() {
    try {
      isLoading = true;
      error = null;
      
      const data = await Midi.fromUrl($midiStore.selectedGeneration?.url);
      midiData = data;
      duration = data.duration;
      
      synth = new Tone.PolySynth(Tone.Synth).toDestination();
      
    } catch (err: any) {
      console.error('Failed to load MIDI:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
  
  async function startPlayback() {
    if (!synth || !midiData) return;
    
    try {
      await Tone.start();
      
      const now = Tone.now();
      const events: Array<{ time: number; note: any }> = [];
      
      midiData.tracks.forEach((track: any) => {
        track.notes.forEach((note: any) => {
          const startTime = now + note.time;
          const endTime = startTime + note.duration;
          
          synth.triggerAttack(note.name, startTime, note.velocity);
          synth.triggerRelease(note.name, endTime);
          
          events.push({ time: startTime, note });
          events.push({ time: endTime, note });
        });
      });
      
      scheduledEvents = events;
      isPlaying = true;
      
      if (stopTimeout) clearTimeout(stopTimeout);
      stopTimeout = setTimeout(() => {
        if (isPlaying) {
          stopPlayback();
        }
      }, duration * 1000);
      
    } catch (err: any) {
      console.error('Playback failed:', err);
      error = err.message;
    }
  }
    
  function stopPlayback() {
    if (!synth) return;
    
    synth.disconnect();
    synth.dispose();
    
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    if (stopTimeout) {
      clearTimeout(stopTimeout);
      stopTimeout = null;
    }
    
    scheduledEvents = [];
    isPlaying = false;
  }

</script>

<div class="player-section">
  <div class="player-header">
    <div><span class="status-led"></span> CURRENT GENERATION</div>
    <div class="generation-badge">#{$generationStore.generationCount}</div>
  </div>
  
 
  {#if $midiStore.selectedGeneration}
    <div class="midi-player">
      {#if error}
        <div class="error">
          {error}
        </div>
      {/if}
      
      {#if isLoading}
        <div class="loading">Loading MIDI...</div>
      {:else if midiData}
        <div class="controls">
          <button 
            onclick={startPlayback} 
            disabled={isPlaying}
            class="play-btn "
          >
            ▶ Play
          </button>
          
          <button 
            onclick={stopPlayback} 
            disabled={!isPlaying}
            class="stop-btn "
          >
            ⏹ Stop
          </button>
        </div>
        
        <div class="info">
          {duration.toFixed(1)} seconds
          {#if isPlaying}
            <span class="playing">● PLAYING</span>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <div class="empty-player">
      <span class="status-waiting">○ NO GENERATION YET</span>
      <p>Click LAUNCH GENERATION to create a melody</p>
    </div>
  {/if}
</div>

<style>
  .midi-player {
    background: #0f1319;
    padding: 1rem;
    border: 1px solid #2a2f3a;
  }
  
  .controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  button {
    background: transparent;
    border: 1px solid #ff8904;
    color: #ff8904;
    padding: 0.5rem 1rem;
    font-family: monospace;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  button:hover:not(:disabled) {
    background: #ff5e3a20;
  }
  
  button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .stop-btn{
    border-color: #ff3e3e;
    color: #ff3e3e;
  }
  
  .info {
    font-size: 0.7rem;
    color: #8f9bb3;
  }
  
  .playing {
    color: #5ac45a;
    margin-left: 0.5rem;
  }
  
  .error {
    color: #ff3e3e;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    text-align: center;
    text-transform: uppercase;
    min-height:2rem;
  }
  
  .loading {
    color: #ff8904;
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

  @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
  }
</style>