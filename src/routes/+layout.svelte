<script lang="ts">
  import "../app.css";

  let { children } = $props();

  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { ArrowLeft } from "lucide-svelte";
  import { Paperclip } from "lucide-svelte";
  import { Calendar } from "lucide-svelte";
  import { CircleUser } from "lucide-svelte";
  // import { Github } from ???
</script>

<div class="sticky top-0 z-10 bg-red-500 backdrop-blur-sm">
  <AppBar>
    {#snippet lead()}
      <ArrowLeft size={24} />
    {/snippet}
    {#snippet trail()}
      <Paperclip size={20} />
      <Calendar size={20} />
      <CircleUser size={20} />
    {/snippet}
    <!-- {#snippet headline()}
      <h2 class="h2">Headline</h2>
    {/snippet} -->
  </AppBar>
</div>
{@render children()}
