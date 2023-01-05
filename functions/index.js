const functions = require("firebase-functions");
const logger = require("./droneLogger")
//Cloud Function location
const europeWest = functions.region("europe-west1")
const europeWestHttps = europeWest.https;

//functions only available with emulator for dev
if (process.env.FUNCTIONS_EMULATOR) {

  exports.updateDB = europeWestHttps.onCall(async () => {
    logger.handleSchelude();
    return 'Cycle started'
  });

  exports.getDrones = europeWestHttps.onCall(async (data, context) => {
    return await logger.getDrones();
  });

}

exports.cloudUpdateDB = europeWestHttps.onRequest((req, res) => {
  logger.updateDB();
  res.json({result: `Message with ID: added.`});
});


exports.updateLastVisited = europeWestHttps.onCall(async (data, context) => {
  return await logger.updateLastVisited();
});

//pubsub emulator removed for being complicated and useless. See https://cloud.google.com/pubsub/docs/emulator
//firebase deploy --only functions scheduledFunction
exports.scheduledFunction = europeWest.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  await logger.handleSchelude();
  return null;
});
