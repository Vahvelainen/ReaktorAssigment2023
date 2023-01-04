const axios = require('axios');
const xml2js = require('xml2js');
const functions = require("firebase-functions");
const admin = require('firebase-admin');

var cors = require('cors');    

const parser = new xml2js.Parser({ attrkey: "ATTR", explicitArray: false });

admin.initializeApp();
const db = admin.firestore();

//Cloud Function location
const europeWestHttps = functions.region("europe-west1").https;


exports.helloWorld = europeWestHttps.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebass!");
});

exports.updateDB = europeWestHttps.onCall(async () => {
  return await updateDB();
});

exports.getDrones = europeWestHttps.onCall(async (data, context) => {
  return await getDronesWithViolationInfo();
});

async function updateDB() {
  const collection = db.collection('violations');

  let violations = await getViolationsFromDB();
  violations = deleteOldViolations(violations);

  const drones = await getDronesWithViolationInfo();
  const violatingDrones = drones.filter( drone => drone.onNDZ);
  
  for (let i = 0; i < violatingDrones.length; i++) {
    const drone = violatingDrones[i];
    const violation = await logViolation(drone, violations);
    violations.push(violation)
  }

  return violations
}

async function logViolation(drone, violations) {
  const collection = db.collection('violations')
  const violationSerialNumbers = violations.length ? violations.map( violation => violation.serialNumber) : [];
  let violation

  const index = violationSerialNumbers.indexOf(drone.serialNumber);
  //simply logging
  if ( index != -1 ) { //-1 === didn't find
    violation = violations[index];
    const res = await collection.doc(drone.serialNumber).set({
      last_violated: admin.firestore.Timestamp.now(),
      distanceToNest: Math.min(drone.distanceToNest, violation.distanceToNest),
    });
  } else {
    const resp = await axios.get("https://assignments.reaktor.com/birdnest/pilots/" + drone.serialNumber );
    const violator = resp.data;
    violation = {
      ...drone,
      ...violator,
      last_violated: admin.firestore.Timestamp.now(),
    }
    const res = await collection.doc(drone.serialNumber).set(violation);
  }
  return violation;
}

function deleteOldViolations(violations) {
  const collection = db.collection('violations')
  let stillRelevantViolations = [];

  for (let i = 0; i < violations.length; i++) {
    const violation = violations[i];
    const violationTime = violation.last_violated.toDate()
    const now = new Date();

    if ( now.valueOf() - violationTime.valueOf() > minutesToMillisecons(10) ) { 
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
  drones.forEach(drone => {
    const distanceToNest = euclideanDistance2D(drone.positionX, drone.positionY, 250000, 250000);
    const onNDZ = distanceToNest < 100000;
    dronesWithViolationInfo.push({
       ...drone, 
       onNDZ: onNDZ,
       distanceToNest: distanceToNest,
    });
  });
  return dronesWithViolationInfo
}

async function getDrones() {
  let error, result = await httpGetAndParseXML('http://assignments.reaktor.com/birdnest/drones');
  return result.report.capture.drone;
}

function checkNDZ(x, y) {
  return ( euclideanDistance2D(x, y, 250000, 250000) < 100000 )
}

function euclideanDistance2D(x1, y1, x2, y2) {
  const distX = Math.abs( x1 - x2 )
  const distY = Math.abs( y1 - y2 )
  return Math.hypot( distX, distY )
}

async function httpGetAndParseXML(URL) {
  const resp = await axios.get(URL)

  let error = null;
  let result = "";

  parser.parseString(resp.data, (err, res) => {
    result = res;
    error = err;
  });
  return error, result

}

function minutesToMillisecons(minutes) {
  return 1000 * 60 * minutes
}