<script lang="ts">
  import '../app.css'

  let { children } = $props()

  import { AppBar } from '@skeletonlabs/skeleton-svelte'
  import { ArrowLeft } from 'lucide-svelte'
  import { Paperclip } from 'lucide-svelte'
  import { Calendar } from 'lucide-svelte'
  import { CircleUser } from 'lucide-svelte'
  import { Navigation } from '@skeletonlabs/skeleton-svelte'
  import { goto } from '$app/navigation'

  // State
  let routeLabel: string = $state('create')
</script>

<div>{routeLabel}</div>
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
    <Navigation.Bar
      value={routeLabel}
      onValueChange={(newValue) => (routeLabel = newValue)}
    >
      <Navigation.Tile href="/" label="Home"></Navigation.Tile>
      <Navigation.Tile href="/create-document" label="Create"></Navigation.Tile>
      <Navigation.Tile href="/admin" label="Admin"></Navigation.Tile>
    </Navigation.Bar>
    <span class="text-lg font-semibold text-white">Russian Learning</span>
  </AppBar>
</nav>
{@render children()}
