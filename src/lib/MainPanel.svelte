<script lang="ts">
  import { handleClick } from "$lib";
  import type { PageState } from "$lib";

  // Get pageState from props
  let { pageState } = $props();

  // State for the processed HTML content
  let processedHtml = $state<string | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Load the processed HTML content
  async function loadContent() {
    try {
      loading = true;
      error = null;

      // Fetch the processed HTML content
      const response = await fetch("/api/content");

      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.statusText}`);
      }

      const data = await response.json();
      processedHtml = data.processedHtml;
    } catch (err) {
      console.error("Error loading content:", err);
      error = err instanceof Error ? err.message : String(err);
    } finally {
      loading = false;
    }
  }

  // Load content when the component is mounted
  loadContent();
</script>

<section class="text-black bg-white p-4 h-full w-full overflow-hidden">
  {#if loading}
    <div class="flex items-center justify-center h-full">
      <div class="text-lg text-gray-600">Loading content...</div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center h-full">
      <div class="text-lg text-red-600">Error: {error}</div>
    </div>
  {:else if processedHtml}
    <div
      class="w-full h-full overflow-y-auto"
      style="max-height: 100%; overflow-y: auto;"
      onclick={(e) => handleClick(e, pageState)}
      onkeydown={(e) => e.key === "Enter" && handleClick(e, pageState)}
      role="textbox"
      tabindex="0"
      aria-label="Russian text with clickable words"
    >
      {@html processedHtml}
    </div>
  {:else}
    <div class="flex items-center justify-center h-full">
      <div class="text-lg text-red-600">No content available</div>
    </div>
  {/if}
</section>
