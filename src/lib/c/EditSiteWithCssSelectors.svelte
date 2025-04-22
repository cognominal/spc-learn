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
  import {
    getNonTailwindClasses,
    isValidUrl,
    isValidSelector,
  } from '$lib/utils'
  let url = $state(
    'http://users.uoa.gr/~nektar/arts/tributes/antoine_de_saint-exupery_le_petit_prince/the_little_prince.htm',
  )

  let content = $derived(() => {
    const formData = new FormData()
    formData.append('cookieValue', url)
    fetch('/api/getpage', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        return data.content // Assuming the response has a 'content' field
      })
      .catch((error) => {
        console.error('Error fetching content:', error)
        return '' // Return empty string on error
      })
  })

  let title = $state('')
  let selectors: string[] = $state(['p'])
  let selectorInputs: Array<HTMLInputElement | null> = $state([])
  let elt: HTMLElement | null = null
  let iframe1 = $state<HTMLIFrameElement | null>(null)
  let iframe2 = $state<HTMLIFrameElement | null>(null)

  let { index, updateJson } = $props()

  $effect(() => {
    updateJson(index, { url, title, selectors })
  })

  let iframe1Doc = $derived<Document | null>(
    (iframe1?.contentDocument || iframe1?.contentWindow?.document) ?? null,
  )
  let iframe2Doc = $derived<Document | null>(
    (iframe2?.contentDocument || iframe2?.contentWindow?.document) ?? null,
  )

  // let { name, indice  } : { name: string, indice: number }= $props()

  onMount(() => {})
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
  <div class="flex flex-col gap-2">
    {#each selectors as selector, index}
      <Selector
        {index}
        bind:selectors
        bind:selectorInputs
        {iframe1Doc}
        {iframe2Doc}
      ></Selector>

      <!-- {@const validSel = isValidSelector(selector)}
      <span>
        <input
          class="mb-2 p-2 border rounded block"
          type="text"
          placeholder="Enter css selector"
          bind:value={selectors[index]}
          class:bad-entry={!isValidSelector(selector)}
          bind:this={selectorInputs[index]}
          onkeydown={(e) => handleSelectorKeydown(e, index)}
        />
        {#if !validSel}
          <span style="color: red"> Invalid selector </span>
        {/if}
      </span>
      <span></span> -->
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
