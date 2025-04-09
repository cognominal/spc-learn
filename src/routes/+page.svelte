<script lang="ts">
  /* @tailwind */
  import { SplitPane } from "@rich_harris/svelte-split-pane";
  import { handleClick } from "$lib";
  import type { PageState } from "$lib";

  let { data } = $props();

  // Use individual reactive properties instead of a class instance
  let selectedWord = $state<string | null>(null);
  let wordDefinition = $state<string | null>(null);
  let iframeLoading = $state(true);

  // Create a pageState object that references the reactive variables
  // This allows us to pass it to functions that expect a PageState object
  const pageState: PageState = {
    get selectedWord() {
      return selectedWord;
    },
    set selectedWord(value) {
      selectedWord = value;
    },

    get wordDefinition() {
      return wordDefinition;
    },
    set wordDefinition(value) {
      wordDefinition = value;
    },

    get iframeLoading() {
      return iframeLoading;
    },
    set iframeLoading(value) {
      iframeLoading = value;
    },

    setSelectedWord(word: string | null) {
      selectedWord = word;
    },
    setWordDefinition(definition: string | null) {
      wordDefinition = definition;
    },
    setIframeLoading(loading: boolean) {
      iframeLoading = loading;
    },
  };

  let iframeElement: HTMLIFrameElement | null = $state(null);

  // This function is only for initial iframe setup
  function handleIframeLoad(event: Event) {
    iframeElement = event.target as HTMLIFrameElement;
    updateIframeContent();
  }

  // Separate function to update iframe content
  function updateIframeContent() {
    if (!iframeElement) return;

    const iframeDoc =
      iframeElement.contentDocument || iframeElement.contentWindow?.document;

    if (!selectedWord) {
      iframeLoading = false;
      return;
    }

    if (!iframeDoc) {
      console.error("Could not access iframe document");
      iframeLoading = false;
      return;
    }

    // If we have a definition, use it
    if (wordDefinition) {
      // Set the iframe content using the definition
      iframeDoc.body.innerHTML = wordDefinition;

      // Add styles
      const style = iframeDoc.createElement("style");
      style.textContent = `
        body {
          padding: 1rem !important;
          margin: 0 !important;
          font-family: system-ui, -apple-system, sans-serif;
        }
        #Russian-content {
          max-width: 800px;
          margin: 0 auto;
        }
        table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
        }
        td, th {
          border: 1px solid #ddd;
          padding: 0.5rem;
        }
        h2 {
          border-bottom: 2px solid #eee;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .IPA {
          font-family: "Courier New", monospace;
        }
        a {
          color: #2563eb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      `;
      iframeDoc.head.appendChild(style);
      iframeLoading = false;
    } else if (selectedWord) {
      // If we don't have a definition yet but have a selected word, show loading message
      iframeDoc.body.innerHTML = `
        <div class="p-4 text-center">
          Loading definition for "${selectedWord}"...
        </div>
      `;
    }
  }

  // Effect to update iframe content when wordDefinition changes
  $effect(() => {
    // This will run whenever wordDefinition changes
    if (wordDefinition !== null) {
      console.log("Definition changed, updating iframe");
      updateIframeContent();
    }
  });
</script>

<main class="w-full h-screen mx-auto p-5 flex flex-col overflow-hidden">
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
      <section class="text-black bg-white p-4 h-full w-full overflow-hidden">
        {#if data?.processedHtml}
          <div
            class="w-full h-full overflow-y-auto"
            style="max-height: 100%; overflow-y: auto;"
            onclick={(e) => handleClick(e, pageState)}
            onkeydown={(e) => e.key === "Enter" && handleClick(e, pageState)}
            role="textbox"
            tabindex="0"
            aria-label="Russian text with clickable words"
          >
            {@html data.processedHtml}
          </div>
        {:else}<div class="text-5xlred">missing content</div>{/if}
      </section>
    {/snippet}

    {#snippet b()}
      {#if selectedWord}
        <div class="relative w-full h-full">
          {#if iframeLoading}
            <div
              class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75"
            >
              <div class="text-lg text-gray-600">Loading...</div>
            </div>
          {/if}
          <iframe
            title="wiktionary"
            id="wiktionary-frame"
            srcdoc="<html><body></body></html>"
            onload={handleIframeLoad}
            bind:this={iframeElement}
            class="w-full h-full border-none"
          ></iframe>
        </div>
      {:else}
        <div class="bg-white p-5 rounded-lg shadow-lg overflow-y-auto">
          <h3 class="text-3xl text-blue-700">
            Select a russian word on the top panel to see its definition
          </h3>
        </div>
      {/if}
    {/snippet}
  </SplitPane>
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
