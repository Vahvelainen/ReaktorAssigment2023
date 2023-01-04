<script>
  import { doc, onSnapshot } from "firebase/firestore";
  import {db} from '@lib/firebase'
  import { onMount, onDestroy } from 'svelte';

  let drones = []
  let unsubDrones = () => {}

  onMount( () => {
    const d = doc(db, "app-data", "sky_picture")
    unsubDrones = onSnapshot(d, (doc) => {
      const data = doc.data();
      let droneSnap = []
      for (let i = 0; i < data.count; i++) {
        droneSnap.push({
          x: data.x[i],
          y: data.y[i],
          onNDZ: data.onNDZ[i],
        })
        drones = droneSnap
      }
    })
  })

  onDestroy( () => {
    unsubDrones()
    clearInterval(helloInterval)
  })

</script>

  <div class="live">
    <div class="ndz"></div>
    {#each drones as drone}
      <div 
        class="dot"
        style="
          left:{ drone.x / 5000 }%;
          top:{ drone.y / 5000 }%;
          background-color:{ drone.onNDZ ? 'red' : 'blue' }"
      ></div>
    {/each}
  </div>

  <style>
    .live {
      position: relative;
      width: 500px;
      height: 500px;
      border: 2px solid black;
      background-color: lightblue;
      border-radius: 5px;
    }

    .ndz {
      position: absolute;
      border: 1px solid red;
      height: 200px;
      width: 200px;
      left: 50%;
      top: 50%;
      transform: 
        translateX(-100px)
        translateY(-100px)
      ;
      border-radius: 999px;
    }

    .dot {
      position: absolute;
      background-color: black;
      border: 1px solid black;
      height: 10px;
      width: 10px;
      transform: 
        translateX(-5px)
        translateY(-5px)
      ;
      border-radius: 99px;
    }

  </style>