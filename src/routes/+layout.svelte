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

<nav
  class="sticky top-0 z-10 px-2 pt-2"
  style="background: linear-gradient(90deg, #fbb6ce 0%, #fbcfe8 100%); height: fit-content;"
>
  <AppBar
    background="bg-rose-200"
    shadow="shadow-lg"
    border="rounded-lg"
    classes="drop-shadow-md"
    style="height: fit-content; min-height: 0;"
  >
    {#snippet lead()}
      <ArrowLeft size={24} />
    {/snippet}
    {#snippet trail()}
      <Paperclip size={20} />
      <Calendar size={20} />
      <CircleUser size={20} />
    {/snippet}
    <div
      class="flex items-center w-auto max-w-max"
      style="height: fit-content; min-height: 0;"
    >
      <span class="text-lg font-semibold text-white mr-6"
        >Language Learning</span
      >
      <Navigation.Bar
        value={routeLabel}
        onValueChange={(newValue) => (routeLabel = newValue)}
        background="bg-white/70"
        backgroundActive="bg-rose-200"
        rounded="full"
        roundedActive="full"
        shadow="none"
        border="none"
        class="text-rose-700"
      >
        <Navigation.Tile
          href="/"
          label="Home"
          background="bg-white/0"
          rounded="full"
        />
        <Navigation.Tile
          href="/create-document"
          label="Create"
          background="bg-white/0"
          rounded="full"
        />
        <Navigation.Tile
          href="/processed-documents"
          label="Documents"
          background="bg-white/0"
          rounded="full"
        />

        <Navigation.Tile
          href="/admin"
          label="Admin"
          background="bg-white/0"
          rounded="full"
        />
      </Navigation.Bar>
    </div>
  </AppBar>
</nav>
{@render children()}
