<script lang="ts">
  import { SplitPane } from "@rich_harris/svelte-split-pane";
  import WiktDefnPanel from "$lib/WiktDefnPanel.svelte";
  import MainPanel from "$lib/MainPanel.svelte";

  // No need for data prop anymore as MainPanel fetches its own data

  // Define the PageState class with reactive members
  export class PageState {
    selectedWord = $state<string | null>(null);
    wordDefinition = $state<string | null>(null);
    iframeLoading = $state(true);
    onePanel = $state(true);
  }

  // Create an instance of PageState
  let pageState = new PageState();

  // Effect to update the panel layout when a word is selected
  $effect(() => {
    if (pageState.selectedWord) {
      pageState.onePanel = false;
    }
  });
</script>

<main class="w-full h-screen mx-auto p-5 flex flex-col overflow-hidden">
  {#if pageState.onePanel}
    <MainPanel {pageState}></MainPanel>
  {:else}
    <SplitPane
      type="horizontal"
      id="lower-split"
      min="200px"
      max="-200px"
      pos="50%"
      --color="#e5e7eb"
      --thickness="4px"
    >
      {#snippet a()}
        <MainPanel {pageState}></MainPanel>
      {/snippet}

      {#snippet b()}
        <WiktDefnPanel {pageState}></WiktDefnPanel>
      {/snippet}
    </SplitPane>
  {/if}
</main>

<style>
  :global(.russian-word) {
    cursor: pointer;
    border-bottom: 1px dashed #9ca3af;
    display: inline-block;
    padding-left: 0.125rem;
    padding-right: 0.125rem;
  }

  :global(.russian-word:hover) {
    background-color: #f3f4f6;
  }
</style>
