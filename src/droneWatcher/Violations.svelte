<script>
  import { collection, onSnapshot, query, orderBy, } from "firebase/firestore";
  import {db} from '@lib/firebase'
  import { onMount, onDestroy } from 'svelte';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

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

  <DataTable table$aria-label="Violation list" style="max-width: 100%;">
    <Head>
      <Row>
        <Cell>Name</Cell>
        <Cell>Email</Cell>
        <Cell>Phone Number</Cell>
        <Cell numeric>Closest distance</Cell>
      </Row>
    </Head>
    <Body>
      {#each violations as violation (violation.serialNumber)}
        <Row>
          <Cell>{violation.firstName} {violation.lastName}</Cell>
          <Cell>{violation.email}</Cell>
          <Cell>{violation.phoneNumber}</Cell>
          <Cell numeric>{ Math.round(violation.distanceToNest / 10) / 100 } meters</Cell>
        </Row>
      {/each}
    </Body>
  </DataTable>

</section>
