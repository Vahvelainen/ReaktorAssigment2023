<script>
  import {updateDB, updateLastVisited} from '@lib/cloudFunctions'
  import { collection, doc, onSnapshot, query, orderBy, } from "firebase/firestore";
  import {db} from '@lib/firebase'
  import { onMount, onDestroy } from 'svelte';

  let drones = []
  let violations = []

  const d = doc(db, "app-data", "sky_picture")
  const unsubDrones = onSnapshot(d, (doc) => {
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

  const violationsRef = collection(db, "violations")
  const q = query(violationsRef, orderBy('last_violated'))
  const unsubViolations = onSnapshot(q, (querySnapshot) => {
    const violationsSnap = []
    querySnapshot.forEach((doc) => {
      violationsSnap.push(doc.data())
    });
    violations = violationsSnap
  });

  updateLastVisited()
  const helloInterval = setInterval(function() {
    updateLastVisited()
  }, 60000);

  onDestroy( () => {
    unsubViolations()
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

  <button on:click={ async () => console.log( await updateDB() ) }>manual start</button>

  {#each violations as violation}
    <div>
      <p><strong>{violation.firstName} {violation.lastName}, {violation.phoneNumber}</strong></p>
      <p>Closest to the nest: { Math.round(violation.distanceToNest / 10) / 100 } meters</p>
    </div>
  {/each}


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

    div {
      width: 500px;
    }

  </style>