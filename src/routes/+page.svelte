<script lang="ts">
  /* @tailwind */
  import { SplitPane } from "@rich_harris/svelte-split-pane";
  import { handleClick, PageState } from "$lib";

  let { data } = $props();
  // let pageState.selectedWord: string | null = $state(null);
  // let wordDefinition: string | null = $state(null);
  // let iframeLoading = $state(true);

  let pageState = $state(new PageState());

  async function handleIframeLoad(event: Event) {
    const iframe = event.target as HTMLIFrameElement;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!pageState.selectedWord) {
      pageState.iframeLoading = false;
      return;
    }

    if (!iframeDoc) {
      console.error("Could not access iframe document");
      pageState.iframeLoading = false;
      return;
    }

    iframeDoc.body.innerHTML = `
      <div class="p-4 text-center">
        Loading definition for "${pageState.selectedWord}"...
      </div>
    `;

    try {
      const response = await fetch(
        `/api/wiktionary/${encodeURIComponent(pageState.selectedWord)}`
      );

      if (!response.ok) {
        iframeDoc.body.innerHTML = `<div class="p-4">Error loading definition for ${pageState.selectedWord}</div>`;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const innerHtml = await response.text();

      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = innerHtml;

      // Find Russian section in the fetched content
      const russianSection = tempDiv.querySelector("#Russian");
      if (russianSection) {
        const content = document.createElement("div");
        content.id = "Russian-content";

        // Add the Russian heading
        const heading = russianSection.parentElement;
        if (heading) content.appendChild(heading.cloneNode(true));

        // Add all content until next h2
        let currentElement = heading?.nextElementSibling;
        while (currentElement && currentElement.tagName !== "H2") {
          content.appendChild(currentElement.cloneNode(true));
          currentElement = currentElement.nextElementSibling;
        }

        // Set the iframe content
        iframeDoc.body.innerHTML = "";
        iframeDoc.body.appendChild(content);

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
      } else {
        iframeDoc.body.innerHTML = `<div class="p-4">No Russian definition found for "${pageState.selectedWord}"</div>`;
      }
    } catch (error) {
      console.error("Error processing content:", error);
      iframeDoc.body.innerHTML = `<div class="p-4">Error loading definition for "${pageState.selectedWord}"</div>`;
    } finally {
      pageState.iframeLoading = false;
    }
  }
</script>

<main class="w-full h-screen mx-auto p-5 flex flex-col">
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
      <section class="overflow-y-auto text-black bg-white p-4 h-full">
        {#if data?.processedHtml}
          <div
            class="w-full"
            onclick={(e) => handleClick(e, pageState)}
            onkeydown={(e) => e.key === "Enter" && handleClick(e)}
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
      {#if pageState.selectedWord}
        <div class="relative w-full h-full">
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
b

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
