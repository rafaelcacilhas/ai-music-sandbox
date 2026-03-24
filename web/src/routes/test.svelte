<script lang="ts">
  import { onMount } from 'svelte';
  import MidiPlayer from '../components/player.svelte';
  
  let midiUrl = $state('');
  let isLoading = $state(true);
  
  onMount(async () => {
    const ToneMidi = await import('@tonejs/midi');
    const midi = new ToneMidi.Midi();
    const track = midi.addTrack();
    
    track.addNote({ midi: 60, time: 0, duration: 0.5, velocity: 100 });
    track.addNote({ midi: 62, time: 0.5, duration: 0.5, velocity: 100 });
    track.addNote({ midi: 64, time: 1.0, duration: 0.5, velocity: 100 });
    
    const midiArray = midi.toArray();
    const blob = new Blob([midiArray.buffer], { type: 'audio/midi' });
    midiUrl = URL.createObjectURL(blob);
    isLoading = false;
  });
</script>

{#if isLoading}
  <div>Loading test MIDI...</div>
{:else}
  <MidiPlayer midiUrl={midiUrl} />
{/if}