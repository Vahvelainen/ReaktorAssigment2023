const axios = require('axios');
const admin = require('firebase-admin');
const utils = require('./utils')

admin.initializeApp();
const db = admin.firestore();

exports.handleSchelude = handleSchelude;
exports.getDrones = getDronesWithViolationInfo;
exports.updateDB = updateDB;
exports.updateLastVisited = updateLastVisitedToNow;

async function handleSchelude() {
  console.log('cycle start');

  let doc = db.collection('app-data').doc('schedule')
  let ref = await doc.get()
  let appData = ref.data()
  let lastVisit = appData.last_visit.toDate()

  //timeout after 30min since last client update
  const shouldBeScheduling = utils.differenseInMinutes( lastVisit, new Date() ) < 30;

  if ( shouldBeScheduling  ) {
    scheduleDroneUpdates();
  }
  
  if (appData.scheduling != shouldBeScheduling) {
    doc.set({
      last_visit: lastVisit,
      scheduling: shouldBeScheduling,
    })
    
    if (shouldBeScheduling) {
      console.log('sheduling start');
    }
    if (!shouldBeScheduling) {
      console.log('sheduling end');
    }
  }
}

async function scheduleDroneUpdates() {
  //Not ideal, but the way google advises to do updates more frequent than a minute
  //https://groups.google.com/g/firebase-talk/c/utm8IlV4GWU?pli=1
  let promises = [];
  for (let i = 0; i < 30; i++) {
    promises.push(callCloudUpDateDB());
    if ( i < 29 ) {
      await utils.sleep(2000);
    }
  }
  //await Promise.all(promises);
  console.log('cycle end');
}

async function updateLastVisitedToNow() {
  const doc = db.collection('app-data').doc('schedule');
  let ref = await doc.get()
  let appData = ref.data()
  const now = new Date() 
  if (utils.differenseInMinutes( appData.last_visit, now ) > 1) {
    doc.set({
      last_visit: now,
      scheduling: appData.scheduling,
    })
  }
}

async function callCloudUpDateDB() {
  //Calls updateDB as another function to have enough processing power
  let functionURL;
  if (process.env.FUNCTIONS_EMULATOR) {
    //Use emulator
    functionURL = 'http://localhost:5001/reaktorbirdnest/europe-west1/cloudUpdateDB'
  } else {
    //Use production
    functionURL = 'https://europe-west1-reaktorbirdnest.cloudfunctions.net/cloudUpdateDB'
  }
  const res = axios.get(functionURL)
  return res.data
}

async function updateDB() {
  const drones = await getDronesWithViolationInfo();
  setSkypicture(drones);
  
  const collection = db.collection('violations');
  let violations = await getViolationsFromDB();
  violations = deleteOldViolations(violations);
  
  const violatingDrones = drones.filter( drone => drone.onNDZ);
  
  for (let i = 0; i < violatingDrones.length; i++) {
    const drone = violatingDrones[i];
    logViolation(drone, violations);
  }
  
  return
}

async function setSkypicture(drones) {
  let x = [];
  let y = [];
  let onNDZ = [];

  //for intead of maps for performance (idk why, the whole feature is a nice to have extra)
  for (let i = 0; i < drones.length; i++) {
    const drone = drones[i];
    x.push(drone.positionX);
    y.push(drone.positionY);
    onNDZ.push(drone.onNDZ);
  }

  db.collection('app-data').doc('sky_picture').set({
    count: drones.length,
    x: x,
    y: y,
    onNDZ: onNDZ,
    last_update: admin.firestore.Timestamp.now(),
  })
}

async function logViolation(drone, violations) {
  const collection = db.collection('violations')
  const violationSerialNumbers = violations.length ? violations.map( violation => violation.serialNumber) : [];
  const index = violationSerialNumbers.indexOf(drone.serialNumber);
  const now = admin.firestore.Timestamp.now();
  let violation

  console.log(drone.serialNumber, index);
  
  if ( index != -1) { //-1 === didn't find
    
    //update existing
    violation = violations[index];
    const newViolation = {
      ...violation,
      last_violated: now,
    };
    newViolation.distanceToNest = Math.min(drone.distanceToNest, violation.distanceToNest);
    violation = newViolation

  } else {

    //create new one (save only necessary info for performance reasons)
    const resp = await axios.get("https://assignments.reaktor.com/birdnest/pilots/" + drone.serialNumber );
    //add skip if 404
    const pilot = resp.data;
    violation = {
      firstName: pilot.firstName,
      lastName: pilot.lastName,
      phoneNumber: pilot.phoneNumber,
      distanceToNest: drone.distanceToNest,
      serialNumber: drone.serialNumber,
      first_violated: now,
      last_violated: now,
    }
    
  }
  
  collection.doc(drone.serialNumber).set(violation);
  return violation;
}

function deleteOldViolations(violations) {
  const collection = db.collection('violations');
  let stillRelevantViolations = [];

  for (let i = 0; i < violations.length; i++) {
    const violation = violations[i];
    const violationTime = violation.last_violated.toDate()
    const now = new Date();

    if ( utils.differenseInMinutes(violationTime, now) > 10 ) { 
      collection.doc(violation.serialNumber).delete();
      console.log('Deleted violation ' + violation.serialNumber);
    } else {
      stillRelevantViolations.push(violation);
    }
  }

  return stillRelevantViolations
}

async function getViolationsFromDB() {
  let violations = [];
  const collection = db.collection('violations');
  const snapshot = await collection.get();
  snapshot.forEach(doc => {
    violations.push( doc.data() );
  });
  return violations
}


async function getDronesWithViolationInfo() {
  let drones = await getDrones();
  let dronesWithViolationInfo = [];
  for (let i = 0; i < drones.length; i++) { //for loop for performance reasons
    const drone = drones[i];
    const distanceToNest = utils.euclideanDistance2D(drone.positionX, drone.positionY, 250000, 250000);
    const onNDZ = distanceToNest < 100000;
    dronesWithViolationInfo.push({
       ...drone, 
       onNDZ: onNDZ,
       distanceToNest: distanceToNest,
    });
  }
  return dronesWithViolationInfo
}

async function getDrones() {
  let error, result = await utils.httpGetAndParseXML('http://assignments.reaktor.com/birdnest/drones');
  return result.report.capture.drone;
}


