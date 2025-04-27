<script lang="ts">
  // Selectors components are used to match using a css selector in a document and navigate the matches
  import {
    getNonTailwindClasses,
    isValidSelector,
    countSelectorMatches,
  } from '$lib/utils'
  import { onDestroy, onMount, tick } from 'svelte'

  let {
    iframe1Doc = $bindable(),
    iframe2Doc,
    index,
    selectors = $bindable(),
    selectorInputs = $bindable(),
    focusedIndex,
    onFocus,
    onBlur,
  }: {
    iframe1Doc: Document | null
    iframe2Doc: Document | null
    index: number
    selectors: string[]
    selectorInputs: HTMLInputElement[] | null
    focusedIndex: number | null
    onFocus: (i: number) => void
    onBlur: () => void
  } = $props()

  let hovered = $state(false)
  let inputFocused = $state(false)
  let inputText = $state('')
  let inputTextvalid = $derived(isValidSelector(inputText))
  let emptyInputText = $derived(inputText === '')

  let visibleButtons = $derived(hovered || (inputFocused && inputTextvalid))
  let activeButtons = $derived(visibleButtons && !emptyInputText)
  let inactiveButtons = $derived(visibleButtons && emptyInputText)
  let currentMatchIndex = $state(0)
  let matches = $state(0)

  let selectorStates = $state<{ visible: boolean }[]>(
    selectors.map(() => ({ visible: true })),
  )
  let highlightedElement: HTMLDivElement | null = null

  let lastInputText = ''
  let lastI = 0
  $effect(() => {
    console.log('scroll to match', `'${inputText}'`, currentMatchIndex)
    if (inputText === lastInputText && currentMatchIndex === lastI) return

    lastInputText = inputText
    lastI = currentMatchIndex // Update lastI to currentMatchIndex
    scrollToMatch(iframe1Doc, inputText, currentMatchIndex)
    matches = countSelectorMatches(iframe1Doc, inputText)
    highlightElement
  })

  function scrollToMatch(
    doc: Document | null,
    selector: string,
    matchIndex: number,
  ) {
    if (!doc || !inputTextvalid) return
    const matches = Array.from(doc.querySelectorAll(selector))
    if (matches.length === 0) return
    const idx =
      ((matchIndex % matches.length) + matches.length) % matches.length // wrap around
    const el = matches[idx]
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    }
  }

  function handlePrevMatch() {
    handleMatch(-1)
  }
  function handleNextMatch() {
    handleMatch(+1)
  }

  function handleMatch(i: number) {
    if (!activeButtons) return
    const matches = iframe1Doc?.querySelectorAll(inputText) ?? []
    if (matches.length === 0) return
    // Always keep currentMatchIndex in [0, matches.length)
    currentMatchIndex =
      (((currentMatchIndex + i) % matches.length) + matches.length) %
      matches.length
    let elt = matches[currentMatchIndex]
    highlightElement(elt)
  }

  function highlightElement(el: Element) {
    unhighlightElement()
    // Find the iframe element in the parent document that contains el
    let iframe: HTMLIFrameElement | null = null
    try {
      // Find the iframe by matching its contentDocument
      for (const frame of Array.from(
        window.parent.document.getElementsByTagName('iframe'),
      )) {
        if (frame.contentDocument === el.ownerDocument) {
          iframe = frame
          break
        }
      }
    } catch (e) {
      // Cross-origin, do nothing
    }
    if (!iframe) return

    const elRect = (el as HTMLElement).getBoundingClientRect()
    const doc = el.ownerDocument

    // Calculate the position of el relative to the main window
    const left = elRect.left
    const top = elRect.top

    highlightedElement = doc.createElement('div')
    highlightedElement.style.position = 'absolute'
    highlightedElement.style.left = `${left}px`
    highlightedElement.style.top = `${top}px`
    highlightedElement.style.width = `${elRect.width}px`
    highlightedElement.style.height = `${elRect.height}px`
    highlightedElement.style.pointerEvents = 'none'
    highlightedElement.style.background = 'transparent'
    highlightedElement.style.border = '2px solid red'
    highlightedElement.style.zIndex = '9999'
    doc.body.appendChild(highlightedElement)
    return highlightedElement
  }

  function unhighlightElement() {
    if (highlightedElement) {
      highlightedElement.remove()
      highlightedElement = null
    }
  }

  onDestroy(() => {
    unhighlightElement()
  })

  // Reset currentMatchIndex when selector changes
  $effect(() => {
    selectors[index] = inputText // Update the selector with the inputText
    currentMatchIndex = 0
    // Keep selectorStates in sync with selectors length
    while (selectorStates.length < selectors.length)
      selectorStates.push({ visible: true })
    while (selectorStates.length > selectors.length) selectorStates.pop()
  })

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

<div
  class="flex items-center gap-2"
  aria-label="CSS selector input row"
  role="group"
>
  <span
    class="selector-row flex items-center gap-2 group"
    onmouseenter={() => (hovered = true)}
    onmouseleave={() => (hovered = false)}
    aria-label="CSS selector input row"
    role="group"
  >
    <button
      class="selector-btn bg-transparent border border-red-300 rounded text-red-600 focus-visible:ring-2 focus-visible:ring-red-400 hover:bg-red-100 hover:border-red-500 hover:text-red-800 px-2 py-1 mr-4"
      aria-label="Delete selector"
      onclick={() => {
        if (selectors.length > 1) {
          selectors.splice(index, 1)
          selectorStates.splice(index, 1)
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
    <span
      class="ml-1 mr-2 align-middle px-2 py-1 transition-opacity duration-200"
      class:opacity-100={activeButtons}
      class:opacity-50={inactiveButtons}
      class:pointer-events-auto={visibleButtons}
      class:opacity-0={!visibleButtons}
      class:pointer-events-none={!visibleButtons}
    >
      <input
        type="checkbox"
        aria-label="hide selected element on procesed document"
        onchange={(e) =>
          (selectorStates[index].visible = (
            e.target as HTMLInputElement
          ).checked)}
      />
      <button
        class="btn bg-transparent border border-gray-300 rounded text-inherit cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 hover:bg-indigo-100 hover:border-indigo-500 hover:text-indigo-800 px-2 py-1"
        aria-label="Previous selector"
        onclick={handlePrevMatch}
        type="button"
        tabindex="0"
        disabled={!inputTextvalid ||
          countSelectorMatches(iframe1Doc, inputText) < 2}
      >
        &lt;
      </button>
      <button
        class="selector-btn bg-transparent border border-gray-300 rounded text-inherit cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 hover:bg-indigo-100 hover:border-indigo-500 hover:text-indigo-800 px-2 py-1"
        aria-label="Next selector"
        onclick={handleNextMatch}
        type="button"
        tabindex="0"
        disabled={!inputTextvalid ||
          countSelectorMatches(iframe1Doc, inputText) < 2}
      >
        &gt;
      </button>
    </span>

    <input
      class="mb-2 p-2 border rounded"
      style="flex:1 1 0; min-width: 0;"
      type="text"
      placeholder="Enter css selector"
      bind:value={inputText}
      class:bad-entry={!inputTextvalid}
      bind:this={selectorInputs![index]}
      onfocus={() => {
        onFocus(index)
        inputFocused = true
      }}
      onblur={() => {
        inputFocused = false
        onBlur()
      }}
      onkeydown={(e) => handleSelectorKeydown(e, index)}
      aria-label="CSS selector input"
      tabindex="0"
    />
  </span>

  {#if inputText.trim() !== ''}
    {#if inputTextvalid}
      {@const matches = countSelectorMatches(iframe1Doc, inputText)}
      {@const matchStr = matches === 1 ? 'match' : 'matches'}
      <span class="whitespace-nowrap"
        >#{currentMatchIndex}/{matches} {matchStr}</span
      >
    {:else}
      <span
        class="text-red-600 whitespace-nowrap"
        role="status"
        aria-live="polite">Invalid selector</span
      >
    {/if}
  {/if}
</div>
