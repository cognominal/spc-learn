<script lang="ts">
  /* @tailwind */
  import { SplitPane } from "@rich_harris/svelte-split-pane";
  let { data } = $props();
</script>

<div class="h-[100vh]">
  <SplitPane
    type="vertical"
    id="main-split"
    min="200px"
    max="-200px"
    pos="50%"
    --color="#e5e7eb"
    --thickness="4px"
  >
    {#snippet a()}
      <!-- <div class="h-full p-4 overflow-y-auto"> -->
      <div style="height: 100%; overflow-y: auto;" class="p-4">
        {#each Array(200) as _, i}
          <div class="mb-2 p-2 text-black bg-gray-100 rounded">
            Line {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing
            elit.
          </div>
        {/each}
      </div>
    {/snippet}

    {#snippet b()}
      <div style="height: 100%; overflow-y: auto;" class="p-4">
        {#each Array(200) as _, i}
          <div class="mb-2 p-2 text-black bg-blue-50 rounded">
            Line {i + 1}: Sed do eiusmod tempor incididunt ut labore et dolore
            magna aliqua.
          </div>
        {/each}
      </div>
    {/snippet}
  </SplitPane>
</div>
