const functions = require("firebase-functions");
const logger = require("./droneLogger")
//Cloud Function location
const europeWest = functions.region("europe-west1")
const europeWestHttps = europeWest.https;

exports.updateDB = europeWestHttps.onCall(async () => {
  logger.handleSchelude();
  return 'asdf'//await updateDB();
});

exports.getDrones = europeWestHttps.onCall(async (data, context) => {
  return await logger.getDrones();
});

//pubsub emulator removed for being complicated and useless. See https://cloud.google.com/pubsub/docs/emulator
//firebase deploy --only functions scheduledFunction
exports.scheduledFunction = europeWest.pubsub.schedule('every 1 minutes').onRun((context) => {
  logger.handleSchelude();
  return null;
});
