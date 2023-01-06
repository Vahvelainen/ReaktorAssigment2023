import { functions } from '@lib/firebase'
import { httpsCallable } from "firebase/functions";

const updateLastVisitedCallable = httpsCallable(functions, 'updateLastVisited');
export const updateLastVisited = async () => {
  const response = await updateLastVisitedCallable();
  return response.data
}

//// Only available in emulator ////
//Returns drone snapshot w. violation info
const getDronesCallable = httpsCallable(functions, 'getDrones');
export const getDrones = async () => {
  const response = await getDronesCallable();
  return response.data
}

//// Only available in emulator ////
//Starts scheduler for the cloud function updating database every 2 seconds
//Runs 1 minute
const updateDBCallable = httpsCallable(functions, 'updateDB');
export const updateDB = async () => {
  const response = await updateDBCallable();
  return response.data
}