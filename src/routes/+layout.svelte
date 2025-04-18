<script lang="ts">
  import '../app.css'

  let { children } = $props()

  import { AppBar } from '@skeletonlabs/skeleton-svelte'
  import { ArrowLeft } from 'lucide-svelte'
  import { Paperclip } from 'lucide-svelte'
  import { Calendar } from 'lucide-svelte'
  import { CircleUser } from 'lucide-svelte'
  import { Navigation } from '@skeletonlabs/skeleton-svelte'

  // State
  let value = $state('files')
  // import { Github } from ???
</script>

<nav class="sticky top-0 z-10 px-2 pt-2">
  <AppBar
    background="bg-rose-400"
    shadow="shadow-lg"
    border="rounded-lg"
    classes="drop-shadow-md"
  >
    {#snippet lead()}
      <ArrowLeft size={24} />
    {/snippet}
    {#snippet trail()}
      <Paperclip size={20} />
      <Calendar size={20} />
      <CircleUser size={20} />
    {/snippet}
    <Navigation.Bar {value} onValueChange={(newValue) => (value = newValue)}>
      <Navigation.Tile id="files" label="Files"></Navigation.Tile>
      <Navigation.Tile id="images" label="Images"></Navigation.Tile>
      <Navigation.Tile id="music" label="Music"></Navigation.Tile>
      <Navigation.Tile id="videos" label="Videos"></Navigation.Tile>
    </Navigation.Bar>
    <span class="text-lg font-semibold text-white">Russian Learning</span>
  </AppBar>
</nav>
{@render children()}
