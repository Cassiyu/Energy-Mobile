import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const firebaseConfig = {
  apiKey: "AIzaSyDjcABtHffkD6K-_K96bAG_Pc4x1o_ZDMg",
  authDomain: "davinci-energy.firebaseapp.com",
  databaseURL: "https://davinci-energy-default-rtdb.firebaseio.com",
  projectId: "davinci-energy",
  storageBucket: "davinci-energy.firebasestorage.app",
  messagingSenderId: "74582968947",
  appId: "1:74582968947:web:d8979e6e2c4c476c4cb806"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };