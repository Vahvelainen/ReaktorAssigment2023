import { functions } from '@lib/firebase'
import { httpsCallable } from "firebase/functions";

const updateLastVisitedCallable = httpsCallable(functions, 'updateLastVisited');
export const updateLastVisited = async () => {
  const response = await updateLastVisitedCallable();
  return response.data
}

const getDronesCallable = httpsCallable(functions, 'getDrones');
export const getDrones = async () => {
  const response = await getDronesCallable();
  return response.data
}

const updateDBCallable = httpsCallable(functions, 'updateDB');
export const updateDB = async () => {
  const response = await updateDBCallable();
  return response.data
}