<script lang="ts">
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
	import StatusLed from './statusLed.svelte';
    const generationStore = getContext('generation') as Writable<{
        modelReady: boolean;
    }>;
</script>

<div class="header">
    <h1>◢ AI MUSIC LAB</h1>
    <h2>▷ SYSTEM STATUS: 
        <span class={$generationStore.modelReady ? 'status-active' : 'status-loading'}>
            <StatusLed color={$generationStore.modelReady ?'green':'yellow'} />
            {$generationStore.modelReady ? 'ACTIVE' : 'LOADING MODEL...'}
        </span> 
        | MELODY GENERATION <span class={$generationStore.modelReady ? 'status-active' : 'status-loading'}> {$generationStore.modelReady ? 'ONLINE' : 'CONNECTING...'}  </span>
    </h2>
</div>

<style>
    .header {
        background: #0b0e12;
        padding: 1.5rem 2rem;
        border-bottom: 2px solid var(--color-red);
        position: relative;
    }

    .header h1 {
        text-transform: uppercase;
        color: var(--color-red);
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
        background: var(--color-red);
    }

    .status-active {
        padding-left: 0.2rem;
        padding-right:0.2rem;
        color: var(--color-green);
    }

    .status-loading {
        color: var(--color-orange);
        animation: pulse 1s infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
    }

</style>