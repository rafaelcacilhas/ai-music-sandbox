<script lang="ts">
  let { trigger = false, duration = 200, segmentCount = 12 } = $props();
  
  let activeSegments = $state(0);
  let show = $state(false);
  let animating = $state(false);
  let animationFinish = $state(false)
  
  $effect(() => {
    if (trigger && !animating && !animationFinish) {
      animating = true;
      show = true;
      activeSegments = 0;
      
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        activeSegments = Math.floor(progress * segmentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            show = false;
            activeSegments = 0;
            animating = false;
            animationFinish = true;
          }, 100);
        }
      };
      requestAnimationFrame(animate);
    }
  });
</script>

<div class="relative h-0">
  {#if show}
    <div class=" absolute left-0 right-0 flex gap-0.5 justify-center z-50 py-2">
      {#each Array(segmentCount) as _, i}
        <div 
          class="w-1 relative overflow-visible"
          style="
            height: {i < activeSegments ? '24px' : '0'};
            opacity: {i < activeSegments ? 1 : 0};
            transition: all 0.05s linear;
          "
        >
          {#if i < activeSegments}
            <div 
              class="absolute top-0 w-full"
              style="
                height: 8px;
                clip-path: polygon(0% 30%, 100% 0%, 100% 100%, 0% 100%);
                background: hsl({60 - (i / activeSegments) * 20}, 100%, 50%);
              "
            ></div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

