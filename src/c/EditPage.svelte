<script lang="ts">
  import { onMount } from 'svelte'
  // import type { PageData } from './$types'
  import { SplitPane } from '@rich_harris/svelte-split-pane'


  let { name: string } = $props()
  let url: string | null = $state(null)
  let selectors: string[] = $state([])

  onMount(() => {})
</script>

<div class="flex flex-col h-full w-full gap-4 p-4">
  <input
    type="text"
    placeholder="Enter URL"
    bind:value={url}
    class="mb-2 p-2 border rounded"
  />
  <div class="flex gap-2">
    {#each selectors as selector, index}
      <input
        type="text"
        placeholder="Enter selector"
        bind:value={selector[index]}
        class="mb-2 p-2 border rounded block"
      />
    {/each}
  </div>
  <button
    onclick={() => {
      selectors.push('')
    }}
    class="mb-2 p-2 border rounded bg-blue-500 text-white"
  >
    Add Selector
  </button>
  <div class="flex-1 min-h-0">
    <iframe
      title="title"
      width="100%"
      height="100%"
      frameborder="0"
      scrolling="auto"
      class="w-full h-full rounded border"
      src={url || undefined}
      style="display: block; min-height: 0; height: 100%; width: 100%; overflow: auto;"
    >
    </iframe>
  </div>
</div>
