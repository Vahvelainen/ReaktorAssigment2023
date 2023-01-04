
<script>
  import {getDrones, updateDB} from '@lib/cloudFunctions'

  let drones = []
  
  loadDrones()

  async function loadDrones() {
    drones = await getDrones();
    console.log( drones[0] ); 
  }

  function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

</script>

  <div class="live">
    <div class="ndz"></div>
    {#each drones as drone}
      <div 
        class="dot"
        style="
          left:{ drone.positionX / 5000 }%;
          top:{ drone.positionY / 5000 }%;
          background-color:{ drone.onNDZ ? 'red' : 'blue' }"
      ></div>
    {/each}
  </div>

  <button on:click={ loadDrones }>update</button>
  <button on:click={ async () => console.log( await updateDB() ) }>updateDB</button>



  {#each drones as drone}
    <div>
      <h4>{drone.manufacturer} {drone.model}</h4>
      <p>{drone.positionX},  {drone.positionY}</p>
      {#if drone.onNDZ }
        <p class="☹"><strong>Violating NDZ</strong></p>
      {:else}
        <p class="😊"><strong>Not violating NDZ</strong></p>
      {/if}
      <p>{drone.distanceToNest}</p>
    </div>
  {/each}


  <style>
    .live {
      position: relative;
      width: 500px;
      height: 500px;
      border: 2px solid black;
      border-radius: 5px;
    }

    .ndz {
      position: absolute;
      background-color: lightblue;
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
      height: 5px;
      width: 5px;
      transform: 
        translateX(-2,5px)
        translateY(-2,5px)
      ;
      border-radius: 99px;
    }

    div {
      width: 500px;
    }

    .☹ {
      color: red;
    }

    .😊 {
      color: green;
    }

  </style>