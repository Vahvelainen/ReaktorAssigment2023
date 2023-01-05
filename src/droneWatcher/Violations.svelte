<script>
  import { collection, onSnapshot, query, orderBy, } from "firebase/firestore";
  import {db} from '@lib/firebase'
  import { onMount, onDestroy } from 'svelte';

  let violations = []
  let unsubViolations = () => {}

  //subscribe to violations collection
  onMount( () => {
    const violationsRef = collection(db, "violations")
    const q = query(violationsRef, orderBy('first_violated', 'desc'))
    unsubViolations = onSnapshot(q, (querySnapshot) => {
      const violationsSnap = []
      querySnapshot.forEach((doc) => {
        violationsSnap.push(doc.data())
      });
      violations = violationsSnap
    })
  })

  onDestroy( () => {
    unsubViolations()
  })

</script>

<section class="violations">
  <h2>Violations</h2>

  <table>
    <tr class="header">
      <th>Name</th>
      <th>Phone Number</th>
      <th>Closest distance</th>
    </tr>
  
    {#each violations as violation}
      <tr>
        <td><strong>{violation.firstName} {violation.lastName}</strong></td>
        <td><strong>{violation.phoneNumber}</strong></td>
        <td>{ Math.round(violation.distanceToNest / 10) / 100 } meters</td>
      </tr>
    {/each}
  </table>
</section>

<style>
  table {
    width: 500px;
    text-align: left;
  }
</style>