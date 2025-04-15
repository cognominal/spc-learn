<script lang="ts">
  import type { PageState } from '$lib';
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
          color: #333;
          line-height: 1.5;
        }

        /* Wiktionary content styles */
        .wiktionary-content {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
        }

        /* Section styles */
        .wiktionary-section {
          margin-bottom: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          overflow: hidden;
        }

        .wiktionary-section-title {
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .wiktionary-section-title:hover {
          background-color: #f3f4f6;
        }

        .wiktionary-section-content {
          padding: 1rem;
        }

        /* Table styles */
        table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
          font-size: 0.9rem;
        }

        td, th {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
        }

        th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        /* Heading styles */
        h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem;
          color: #1e40af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.25rem;
        }

        h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem;
          color: #1e40af;
        }

        /* Other elements */
        .IPA {
          font-family: "Courier New", monospace;
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }

        a {
          color: #2563eb;
          text-decoration: none;
          transition: color 0.2s;
        }

        a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        /* Lists */
        ul, ol {
          margin: 0.5rem 0 0.5rem 1.5rem;
        }

        li {
          margin-bottom: 0.25rem;
        }

        /* Code and pre */
        code, pre {
          font-family: monospace;
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }

        pre {
          padding: 0.5rem;
          overflow-x: auto;
          margin: 0.5rem 0;
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
