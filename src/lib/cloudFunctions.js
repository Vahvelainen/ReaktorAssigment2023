import { functions } from '@lib/firebase'
import { httpsCallable } from "firebase/functions";

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