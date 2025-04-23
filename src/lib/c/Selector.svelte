<script lang="ts">
  import {
    getNonTailwindClasses,
    isValidUrl,
    isValidSelector,
    countSelectorMatches,
  } from '$lib/utils'
  import { onMount, tick } from 'svelte'

  let {
    iframe1Doc,
    iframe2Doc,
    index,
    selectors = $bindable(),
    selectorInputs = $bindable(),
    focusedIndex,
    onFocus,
    onBlur,
  }: {
    iframe1Doc: Document
    iframe2Doc: Document
    index: number
    selectors: string[]
    selectorInputs: HTMLInputElement[] | null
    focusedIndex: number | null
    onFocus: (i: number) => void
    onBlur: () => void
  } = $props()

  //   validSel = isValidSelector(selectors[index])
  let isHovered = $state(false);
  let isInputFocused = $state(false);

  async function handleSelectorKeydown(e: KeyboardEvent, i: number) {
    // console.log("keydown", e.key);
    const trimmed = selectors[i].trim()
    switch (e.key) {
      case 'Enter':
        if (trimmed !== '') {
          selectors.push('')
          await tick() // Wait for DOM update
          selectorInputs![selectors.length - 1]?.focus()
        }
        break
      case 'Backspace':
        if (i !== 0 && trimmed === '' && selectors.length > 1) {
          selectors.splice(i, 1)
          await tick() // Wait for DOM update
          const prevIndex = i > 0 ? i - 1 : 0
          selectorInputs![prevIndex]?.focus()
        }
        break
    }
  }
</script>

<span
  class="selector-row flex items-center gap-2 group"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  aria-label="CSS selector input row"
  role="group"
>
  <button
    class="selector-btn transition-opacity duration-200 bg-transparent border border-red-300 rounded text-red-600 focus-visible:ring-2 focus-visible:ring-red-400 hover:bg-red-100 hover:border-red-500 hover:text-red-800 px-2 py-1 mr-4"
    class:opacity-100={isInputFocused || isHovered}
    class:pointer-events-auto={isInputFocused || isHovered}
    class:opacity-0={!isInputFocused && !isHovered}
    class:pointer-events-none={!isInputFocused && !isHovered}
    class:ring-2={focusedIndex === index}
    class:ring-red-400={focusedIndex === index}
    aria-label="Delete selector"
    onclick={() => {
      if (selectors.length > 1) {
        selectors.splice(index, 1)
        tick().then(() => {
          const prevIndex = index > 0 ? index - 1 : 0
          selectorInputs && selectorInputs[prevIndex]?.focus()
        })
      }
    }}
    type="button"
    tabindex="0"
  >
    ×
  </button>
  <button
    class="selector-btn transition-opacity duration-200 bg-transparent border border-gray-300 rounded text-inherit cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 hover:bg-indigo-100 hover:border-indigo-500 hover:text-indigo-800 px-2 py-1"
    class:opacity-100={isInputFocused || isHovered}
    class:pointer-events-auto={isInputFocused || isHovered}
    class:opacity-0={!isInputFocused && !isHovered}
    class:pointer-events-none={!isInputFocused && !isHovered}
    class:ring-2={focusedIndex === index}
    class:ring-indigo-400={focusedIndex === index}
    aria-label="Previous selector"
    onclick={() => {
      /* Add your click handler logic here */
    }}
    type="button"
    tabindex="0"
  >
    &lt;
  </button>
  <button
    class="selector-btn transition-opacity duration-200 bg-transparent border border-gray-300 rounded text-inherit cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 hover:bg-indigo-100 hover:border-indigo-500 hover:text-indigo-800 px-2 py-1"
    class:opacity-100={isInputFocused || isHovered}
    class:pointer-events-auto={isInputFocused || isHovered}
    class:opacity-0={!isInputFocused && !isHovered}
    class:pointer-events-none={!isInputFocused && !isHovered}
    class:ring-2={focusedIndex === index}
    class:ring-indigo-400={focusedIndex === index}
    aria-label="Next selector"
    onclick={() => {
      /* Add your click handler logic here */
    }}
    type="button"
    tabindex="0"
  >
    &gt;
  </button>
  <input
    class="mb-2 p-2 border rounded block"
    type="text"
    placeholder="Enter css selector"
    bind:value={selectors[index]}
    class:bad-entry={!isValidSelector(selectors[index])}
    bind:this={selectorInputs![index]}
    onfocus={() => { onFocus(index); isInputFocused = true; }}
    onblur={() => { isInputFocused = false; onBlur(); }}
    onkeydown={(e) => handleSelectorKeydown(e, index)}
    aria-label="CSS selector input"
    tabindex="0"
  />
  {#if isValidSelector(selectors[index])}
    {@const matches = countSelectorMatches(iframe1Doc, selectors[index])}
    {@const matchStr = matches === 1 ? 'match' : 'matches'}
    <span class="whitespace-nowrap">{matches} {matchStr}</span>
  {:else}
    <span
      class="text-red-600 whitespace-nowrap"
      role="status"
      aria-live="polite">Invalid selector</span
    >
  {/if}
</span>
