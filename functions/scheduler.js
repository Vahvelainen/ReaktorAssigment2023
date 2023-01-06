const axios = require('axios');
const utils = require('./utils')
const firebase = require('./firebase');

const admin = firebase.admin;
const db = firebase.db;

//scheduler is a tasks that calls update functions periodicly
//Firebase pubSub can be called every minute tops, so we need an other proces make a call every two seconds

//The call is made as an separate request to other cloud function
//This is bc doing everything in a single threath will make it choke.

//Also scheduler excepts client to call updateLastVisitedToNow() or it will shut down if there is no activity in 30 mins
//This is to stay near the no-cost limits of firebase

exports.handleSchelude = handleSchelude;
exports.updateLastVisited = updateLastVisitedToNow;

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

async function callCloudUpDateDB() {
  //Call updateDB as another function bc limited performance on scheduled tasks / single cloud threath
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
