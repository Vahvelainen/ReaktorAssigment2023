const functions = require("firebase-functions");
const logger = require("./droneLogger")
const sheduler = require("./scheduler")

//Cloud Function location
const europeWest = functions.region("europe-west1")
const europeWestHttps = europeWest.https;

exports.cloudUpdateDB = europeWestHttps.onRequest((req, res) => {
  logger.updateDB();
  res.json({result: `Message with ID: added.`});
});

exports.updateLastVisited = europeWestHttps.onCall(async (data, context) => {
  return await sheduler.updateLastVisited();
});

//Wont work in dev, pubsub emulator removed for being complicated and useless.
//https://cloud.google.com/pubsub/docs/emulator
exports.scheduledFunction = europeWest.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  await sheduler.handleSchelude();
  return null;
});

/// Dev functions ///
//Only available with emulator
if (process.env.FUNCTIONS_EMULATOR) {

  exports.updateDB = europeWestHttps.onCall(async () => {
    sheduler.handleSchelude();
    return 'Cycle started'
  });

  exports.getDrones = europeWestHttps.onCall(async (data, context) => {
    return await logger.getDrones();
  });

}