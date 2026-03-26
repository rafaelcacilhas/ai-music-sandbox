<script>
    let {color = "green"} = $props();
</script>

<span class={`status-led ${color}`}></span>

<style>
    .status-led {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius:50%;
        margin-right: 6px;
        animation: pulse 1.5s infinite;
    }

    .green{
        background-color: var(--color-green);
    }
    .red{
        background-color: var(--color-red);
    }
    .yellow{
        background-color: var(--color-yellow);
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
    }
</style>