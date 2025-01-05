// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDbIoLFbnFO77aaoxY_xIavJX-AcuugTBM',
  authDomain: 'jkt48-live.firebaseapp.com',
  projectId: 'jkt48-live',
  storageBucket: 'jkt48-live.firebasestorage.app',
  messagingSenderId: '566192883325',
  appId: '1:566192883325:web:a26aad3d89da1c5b22d314',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
