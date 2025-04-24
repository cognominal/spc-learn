<script lang="ts">
  //   import Spinner from '$c/Spinner.svelte'
  import { SplitPane } from '@rich_harris/svelte-split-pane'
  import Inspect from 'svelte-inspect-value'
  import { dev } from '$app/environment'

  import EditSiteWithCssSelectors from '$lib/c/EditSiteWithCssSelectors.svelte'

  let data = $props()
  let keys = Object.keys(data)
  // console.log('data', data)

  // convoluted way to update `JsonForCookie`
  // A +page.svelte cannot export symbols so the function `updateJson`
  // is passed as a prop to
  // EditPage. The function `updatejson` is called from the child component
  //  in a $effect  and updates `jsonForCookie`
  // Must be a simpler way
  type EditComponentState = {
    url: string
    title: string
    selectors: string[]
  }
  let editComponentsState: EditComponentState[] = []
  let jsonForCookie = $state('')

  
  function updateCookieJson(index: number, state: EditComponentState) {
    editComponentsState[index] = state
    jsonForCookie = JSON.stringify(editComponentsState)
  }

  $effect(() => {
    const formData = new FormData()
    formData.append('cookieValue', jsonForCookie)

    fetch('?/setCookie', {
      method: 'POST',
      body: formData,
    })
  })

  const data1 = { a: 'a', b: 'b' }
</script>

<!-- <Spinner /> -->
<Inspect.Values {data} />
<div class="h-full w-full flex-1 border-gray-100 border-solid">
  <SplitPane
    type="horizontal"
    id="lower-split"
    min="200px"
    max="-200px"
    pos="50%"
    --color="#e5e7eb"
    --thickness="4px"
  >
    {#snippet a()}
      <EditSiteWithCssSelectors index="0" {updateCookieJson} />
    {/snippet}

    {#snippet b()}
      <EditSiteWithCssSelectors index="1" {updateCookieJson} />
    {/snippet}
  </SplitPane>
</div>
