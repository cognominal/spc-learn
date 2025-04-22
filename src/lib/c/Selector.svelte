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
  } = $props()

  //   validSel = isValidSelector(selectors[index])

  async function handleSelectorKeydown(e: KeyboardEvent, i: number) {
    // console.log("keydown", e.key);
    const trimmed = selectors[i].trim()
    switch (e.key) {
      case 'Enter':
        if (trimmed !== '') {
          selectors.push('')
          await tick() // Wait for DOM update
          selectorInputs[selectors.length - 1]?.focus()
        }
        break
      case 'Backspace':
        if (i !== 0 && trimmed === '' && selectors.length > 1) {
          selectors.splice(i, 1)
          await tick() // Wait for DOM update
          const prevIndex = i > 0 ? i - 1 : 0
          selectorInputs[prevIndex]?.focus()
        }
        break
    }
  }
</script>

<span style="display: flex; align-items: center; gap: 0.5em;">
  <input
    class="mb-2 p-2 border rounded block"
    type="text"
    placeholder="Enter css selector"
    bind:value={selectors[index]}
    class:bad-entry={!isValidSelector(selectors[index])}
    bind:this={selectorInputs[index]}
    onkeydown={(e) => handleSelectorKeydown(e, index)}
  />
  {#if isValidSelector(selectors[index])}
    {@const matches = countSelectorMatches(iframe1Doc, selectors[index])}
    {@const matchStr = matches === 1 ? 'match' : 'matches'}
    <span style="white-space: nowrap;">{matches} {matchStr}</span>
  {:else}
    <span style="color: red; white-space: nowrap;">Invalid selector</span>
  {/if}
</span>
