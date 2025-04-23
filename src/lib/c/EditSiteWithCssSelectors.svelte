<!-- This component is used to fetch a page and process it to make 
it part of our learning too. It is fetched and first processed by 
`../getpage.ts` and displayed in two iframes on top of each other.
The original frame and the edited frame.
we create a set of css selector that will be used to supress material
in the edited frame.
 -->

<script lang="ts">
  import { onMount, tick } from 'svelte'
  import Selector from './Selector.svelte'
  import { getNonTailwindClasses, isValidUrl, isValidSelector } from '$lib'
  // temporary setting
  let url = $state(
    'http://users.uoa.gr/~nektar/arts/tributes/antoine_de_saint-exupery_le_petit_prince/the_little_prince.htm',
  )

  $effect(() => {
    // Add any derived state logic here if needed
  })

  let title = $state('')
  let selectors: string[] = $state(['p'])
  let selectorInputs: Array<HTMLInputElement | null> = $state([])
  let elt: HTMLElement | null = null
  let iframe1 = $state<HTMLIFrameElement | null>(null)
  let iframe2 = $state<HTMLIFrameElement | null>(null)
  let fetchError = $state<string | null>(null)

  let { index, updateJson } = $props()

  // Function to fetch and inject HTML into both iframes
  async function updateIframesWithPageHTML() {
    fetchError = null
    if (!isValidUrl(url) || !iframe1 || !iframe2) return

    let result: Response = await fetch('api/getpage', {
      headers: {
        'Content-Type': '*/*',
      },
    })

    let content
    if (!result.ok) {
      fetchError = `Error fetching page: ${result.statusText}`
      return
    } else {
      content = await result.text()
    }

    if (!content) {
      fetchError = 'No content returned.'
      return
    }
    // Write to iframe1
    if (iframe1.contentDocument) {
      iframe1.contentDocument.open()
      iframe1.contentDocument.documentElement.innerHTML = content
      iframe1.contentDocument.close()
    }
    // Write to iframe2
    if (iframe2.contentDocument) {
      iframe2.contentDocument.open()
      iframe2.contentDocument.documentElement.innerHTML = content
      iframe2.contentDocument.close()
    }
  }

  $effect(() => {
    // Update JSON as before
    updateJson(index, { url, title, selectors })
    // Update iframes when url changes and is valid
    if (isValidUrl(url) && iframe1 && iframe2) {
      updateIframesWithPageHTML()
    }
  })

  onMount(() => {
    if (isValidUrl(url) && iframe1 && iframe2) {
      updateIframesWithPageHTML()
    }
  })

  let focusedIndex: number | null = null
  function handleFocus(i: number) {
    focusedIndex = i
  }
  function handleBlur() {
    focusedIndex = null
  }
</script>

<div class="flex flex-col h-full w-full gap-4 p-4">
  <input
    type="text"
    placeholder="Enter URL"
    bind:value={url}
    class:bad-entry={!isValidUrl(url)}
    class="mb-2 p-2 border rounded"
  />
  {#if !isValidUrl(url)}
    <span style="color: red"> Invalid URL </span>
  {/if}
  {#if fetchError}
    <span style="color: red"> {fetchError} </span>
  {/if}
  <div class="flex flex-col gap-2">
    {#each selectors as selector, index}
      <Selector
        {index}
        bind:selectors
        bind:selectorInputs
        {focusedIndex}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    {/each}
  </div>
  <button
    onclick={() => {
      selectors.push('')
    }}
    class="mb-2 px-4 py-2 border rounded bg-blue-500 text-white mx-auto block w-auto text-center"
  >
    Add Selector
  </button>
  <div class="flex-1 min-h-0">
    <iframe
      id="iframe1"
      bind:this={iframe1}
      title="title2"
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
  <div class="flex-1 min-h-0">
    <iframe
      bind:this={iframe2}
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

<style>
  bad-entry {
    border: 2px solid #ef4444 !important;
    background-color: #fee2e2 !important;
  }
</style>
