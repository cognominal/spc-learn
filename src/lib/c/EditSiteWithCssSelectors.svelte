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
  import { getNonTailwindClasses, validUrl, isValidSelector } from '$lib'
  // temporary setting
  let urlString = $state(
    'http://users.uoa.gr/~nektar/arts/tributes/antoine_de_saint-exupery_le_petit_prince/the_little_prince.htm',
  )
  let url = $derived(validUrl(urlString))

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
  let iframe1Doc = $state<Document | null>(null)
  let focusedIndex: number | null = $state(null)

  let { index, updateCookieJson } = $props()

  // Function to fetch and inject HTML into both iframes
  async function getPageHTML(url: URL): Promise<string> {
    let result: Response = await fetch('api/getpage', {
      headers: {
        'Content-Type': '*/*',
        'X-URL': url.toString(),
      },
    })

    if (!result.ok) {
      fetchError = `Error fetching document page at ${url.toString()}: ${result.statusText}`
      return ''
    }
    const content = await result.text()
    if (!content) {
      fetchError = 'No content returned.'
      return ''
    }
    return content
  }

  // Only fetch and update iframe content when the URL changes
  $effect(() => {
    if (url) {
      // console.log('set frame content:', url)
      // Inline the async logic directly
      ;(async () => {
        let content = await getPageHTML(url)
        iframe1.srcdoc = content
        iframe2.srcdoc = content
        iframe1Doc = iframe1.contentDocument
      })()
    }
  })

  // Keep selectors and other state in sync, but don't reload iframes
  $effect(() => {
    if (url) {
      updateCookieJson(index, { url: urlString, title, selectors })
    }
  })

  // onMount(() => {
  //   if (isValidUrl(url) && iframe1 && iframe2) {
  //     updateIframesWithPageHTML()
  //   }
  // })

  function handleFocus(i: number) {
    focusedIndex = i
  }
  function handleBlur() {
    focusedIndex = null
  }

  // Helper: Wait for iframe1 to load and set iframe1Doc
  function setupIframe1LoadListener() {
    if (iframe1) {
      iframe1.addEventListener('load', () => {
        iframe1Doc = iframe1.contentDocument
      })
    }
  }

  onMount(() => {
    setupIframe1LoadListener()
  })

  // Count matches for a selector in iframe1's document
  function countSelectorMatches(selector: string): number {
    if (!iframe1Doc) return 0
    try {
      return iframe1Doc.querySelectorAll(selector).length
    } catch (e) {
      return 0
    }
  }
</script>

<!-- overflow would not work because overflow from layout takes over ? -->
<div class="flex flex-col h-full w-full gap-4 p-4">
  <input
    type="text"
    placeholder="Enter URL"
    bind:value={urlString}
    class:bad-entry={!validUrl(urlString)}
    class="mb-2 p-2 border rounded"
  />
  {#if !url}
    <span style="color: red"> Invalid URL </span>
  {/if}
  {#if fetchError}
    <span style="color: red"> {fetchError} </span>
  {/if}
  <div class="flex flex-col gap-2">
    {#each selectors as selector, index}
      <Selector
        {iframe1Doc}
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
    Add CSS Selector
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
      src={urlString || undefined}
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
