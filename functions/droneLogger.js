const axios = require('axios');
const utils = require('./utils')
const firebase = require('./firebase');

const admin = firebase.admin;
const db = firebase.db;

exports.getDrones = getDronesWithViolationInfo;
exports.updateDB = updateDB;

async function updateDB() {
  const drones = await getDronesWithViolationInfo();
  setSkypicture(drones);
  
  let violations = await getViolationsFromDB();
  violations = deleteOldViolations(violations);
  
  const violatingDrones = drones.filter( drone => drone.onNDZ);
  
  for (let i = 0; i < violatingDrones.length; i++) {
    const drone = violatingDrones[i];
    logViolation(drone, violations);
  }
  
  return
}

function setSkypicture(drones) {
  let x = [];
  let y = [];
  let onNDZ = [];
  let serialNumber = [];

  for (let i = 0; i < drones.length; i++) {
    const drone = drones[i];
    x.push(drone.positionX);
    y.push(drone.positionY);
    onNDZ.push(drone.onNDZ);
    serialNumber.push(drone.serialNumber);
  }

  db.collection('app-data').doc('sky_picture').set({
    count: drones.length,
    x: x,
    y: y,
    onNDZ: onNDZ,
    serialNumber: serialNumber,
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
  
  if ( index != -1) { //-1 means didn't find
    
    // Update existing doc
    violation = violations[index];
    const newViolation = {
      ...violation,
      last_violated: now,
    };
    newViolation.distanceToNest = Math.min(drone.distanceToNest, violation.distanceToNest);
    violation = newViolation

  } else {

    // Create new doc
    const resp = await axios.get("https://assignments.reaktor.com/birdnest/pilots/" + drone.serialNumber );
    if (resp.status != 200) return null
    // (only necessary info for performance reasons)
    const pilot = resp.data;
    violation = {
      firstName: pilot.firstName,
      lastName: pilot.lastName,
      email: pilot.email,
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
  for (let i = 0; i < drones.length; i++) {
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


