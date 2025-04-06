<script lang="ts">
  import { onMount } from "svelte";
  let name = "world";
  let scale = 1;
  let toto: HTMLElement | null = null;

  function runForOneSecond() {
    // The function you want to run
    let t: number;
    function myFunction() {
      console.log(t);
      t -= 0.1;
      //  toto!.style.scale = t
    }

    // Set interval to run every 100ms (1/10 second)
    const intervalId = setInterval(myFunction, 100);

    // Stop after 1 second (1000ms)
    setTimeout(() => {
      t = 1;
      clearInterval(intervalId);
      console.log("Stopped after 1 second");
    }, 1000);
  }

  onMount(() => {
    // runForOneSecond()
  });
  // Call the function to start
</script>

// test page. I have better ways to do it now experimented in another repo

<div>
  <button onclick={runForOneSecond}>push</button>
</div>

before<span bind:this={toto}>ttoto</span> after
