<script lang="ts">
  /* @tailwind */
  import { SplitPane } from "@rich_harris/svelte-split-pane";

  let framea: null | HTMLIFrameElement = null;
  let frameb: null | HTMLIFrameElement = null;
  let url1: string = "";
  let url2: string = "";

  function load() {
    if (framea && url1) {
      framea.src = url1.startsWith("http") ? url1 : `https://${url1}`;
    }
    if (frameb && url2) {
      frameb.src = url2.startsWith("http") ? url2 : `https://${url2}`;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 p-6">
  <!-- Header -->
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">
      Website Comparison Tool
    </h1>
    <p class="text-gray-600">Enter two URLs to compare websites side by side</p>
  </header>

  <!-- URL Input Form -->
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- URL 1 Input -->
      <div>
        <label for="url1" class="block text-sm font-medium text-gray-700 mb-2"
          >First Website URL</label
        >
        <div class="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            id="url1"
            class="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., example.com"
            bind:value={url1}
          />
        </div>
      </div>

      <!-- URL 2 Input -->
      <div>
        <label for="url2" class="block text-sm font-medium text-gray-700 mb-2"
          >Second Website URL</label
        >
        <div class="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            id="url2"
            class="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., example.org"
            bind:value={url2}
          />
        </div>
      </div>
    </div>

    <!-- Load Button -->
    <div class="flex justify-center">
      <button
        on:click={load}
        class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        Load Websites
      </button>
    </div>
  </div>

  <!-- Split Pane Container -->
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <main class="w-full h-[70vh] mx-auto flex flex-col overflow-hidden">
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
          <div class="h-full w-full bg-gray-100 flex flex-col">
            <div
              class="bg-gray-200 p-2 text-sm font-medium text-gray-700 border-b border-gray-300"
            >
              {url1 || "First Website"}
            </div>
            <iframe
              title="First website"
              bind:this={framea}
              class="flex-1 w-full"
            ></iframe>
          </div>
        {/snippet}

        {#snippet b()}
          <div class="h-full w-full bg-gray-100 flex flex-col">
            <div
              class="bg-gray-200 p-2 text-sm font-medium text-gray-700 border-b border-gray-300"
            >
              {url2 || "Second Website"}
            </div>
            <iframe
              title="Second website"
              bind:this={frameb}
              class="flex-1 w-full"
            ></iframe>
          </div>
        {/snippet}
      </SplitPane>
    </main>
  </div>

  <!-- Footer -->
  <footer class="mt-8 text-center text-gray-500 text-sm"></footer>
</div>
