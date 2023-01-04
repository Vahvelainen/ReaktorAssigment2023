<script>
  import {updateDB, updateLastVisited} from '@lib/cloudFunctions'
  import { onMount, onDestroy } from 'svelte';
  import { doc, onSnapshot } from "firebase/firestore";
  import {db} from '@lib/firebase'

  import LiveView from './LiveView.svelte';
  import Violations from './Violations.svelte';
  import Inactive from './Inactive.svelte';

  updateLastVisited()
  let helloInterval
  onMount(() => {
    helloInterval = setInterval(function() {
      updateLastVisited()
    }, 60000)
  })
  
  let online = false;
  let unsunOnline = () => {}

  onMount( () => {
    const d = doc(db, "app-data", "schedule")
    unsunOnline = onSnapshot(d, (doc) => {
      const data = doc.data();
      online = data.scheduling;
    })
  })

  onDestroy( () => {
    clearInterval(helloInterval)
  })
</script>

{#if online }
<h1>Birdsnest</h1>
<LiveView/>
<Violations/>
{:else}
<Inactive/>
{/if}

{#if import.meta.env.DEV }
  <button on:click={ async () => console.log( await updateDB() ) }>manual start</button>
{/if}
