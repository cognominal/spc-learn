<script lang="ts">
  //   import Spinner from '$c/Spinner.svelte'
  import { SplitPane } from '@rich_harris/svelte-split-pane'
  import type { PageData } from './$types'
  import EditPage from '$c/EditPage.svelte'

  let { data }: { data: PageData } = $props()
</script>

<!-- <Spinner /> -->

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
      <EditPage name="first editpage"></EditPage>
    {/snippet}

    {#snippet b()}
      <EditPage></EditPage>
    {/snippet}
  </SplitPane>
</div>
