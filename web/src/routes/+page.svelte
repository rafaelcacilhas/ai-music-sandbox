<script lang="ts">
  import { setContext, onMount } from 'svelte';
  import { generationStore, midiStore } from '$lib/stores/generation';
  import MidiPlayer from '../components/player.svelte';
  import GenerationsViewer from '../components/generation.svelte'
	import ControlPanel from '../components/controlPanel.svelte';
	import Header from '../components/header.svelte';
	import Footer from '../components/footer.svelte';

  setContext('generation', generationStore);
  setContext('midi', midiStore);
</script>

<section>
  <div class="terminal">
    <Header />
    
    <div class="content">
      <ControlPanel />
      <MidiPlayer  />
      <GenerationsViewer />
    </div>

    <Footer />
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

  .content {
    padding: 2rem;
  }
</style>