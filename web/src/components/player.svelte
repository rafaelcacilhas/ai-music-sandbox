<script lang="ts">
  import { onMount } from 'svelte';
  import * as Tone from 'tone';
  import * as ToneMidi from '@tonejs/midi';
  const { Midi } = ToneMidi;
  
  let { midiUrl } = $props();
  
  let isPlaying = $state(false);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let duration = $state(0);
  let synth: Tone.PolySynth = $state({} as Tone.PolySynth);
  let midiData: any = $state(null);
  let stopTimeout: ReturnType<typeof setTimeout> | null = $state(null);
  let scheduledEvents: Array<{ time: number; note: any }> = $state([]);
  
  onMount(() => {
    if (midiUrl) {
      loadMidi();
    }
    
    return () => {
      if (stopTimeout) clearTimeout(stopTimeout);
      if (synth) synth.dispose();
    };
  });
  
  async function loadMidi() {
    try {
      isLoading = true;
      error = null;
      
      const data = await Midi.fromUrl(midiUrl);
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

<div class="midi-player">
  {#if error}
    <div class="error">⚠️ {error}</div>
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
        class="stop-btn"
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
  
  .info {
    font-size: 0.7rem;
    color: #8f9bb3;
  }
  
  .playing {
    color: #5ac45a;
    margin-left: 0.5rem;
  }
  
  .error {
    color: #ff5e3a;
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
  }
  
  .loading {
    color: #ff8904;
  }
</style>