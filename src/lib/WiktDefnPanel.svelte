<script lang="ts">
  import type { PageState } from "$lib";
  import { X } from "lucide-svelte";
  let iframeElement: HTMLIFrameElement | null = $state(null);

  let { pageState }: { pageState: PageState } = $props();

  // Effect to update iframe content when wordDefinition changes
  $effect(() => {
    if (pageState.wordDefinition !== null) {
      updateIframeContent();
    }
  });

  // This function is only for initial iframe setup
  function handleIframeLoad(event: Event) {
    iframeElement = event.target as HTMLIFrameElement;
    updateIframeContent();
  }

  // Function to close the panel and reset state
  function closePanel() {
    pageState.onePanel = true;
    pageState.selectedWord = null;
    pageState.wordDefinition = null;
  }

  // Separate function to update iframe content
  function updateIframeContent() {
    if (!iframeElement) return;

    const iframeDoc =
      iframeElement.contentDocument || iframeElement.contentWindow?.document;

    if (!pageState.selectedWord) {
      pageState.iframeLoading = false;
      return;
    }
    if (!iframeDoc) {
      console.error("Could not access iframe document");
      pageState.iframeLoading = false;
      return;
    }

    // If we have a definition, use it
    if (pageState.wordDefinition) {
      // Set the iframe content using the definition
      iframeDoc.body.innerHTML = pageState.wordDefinition;

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
      pageState.iframeLoading = false;
    }
    // else if (selectedWord) {
    //   // If we don't have a definition yet but have a selected word, show loading message
    //   iframeDoc.body.innerHTML = `
    //     <div class="p-4 text-center">
    //       Loading definition for "${selectedWord}"...
    //     </div>
    //   `;
    // }
  }
</script>

<div class="relative w-full h-full">
  <!-- Close button -->
  <button
    class="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    onclick={closePanel}
    aria-label="Close panel"
    title="Close panel"
  >
    <X size={18} strokeWidth={2.5} />
  </button>

  {#if pageState.iframeLoading}
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
