import { config } from '../components/config';

declare const firebase: any;

let dbInstance: any = null;

export const initFirebase = async () => {
  const firebaseConfig = config.firebase;
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_") || 
      !firebaseConfig.authDomain || firebaseConfig.authDomain.includes("YOUR_") || 
      !firebaseConfig.projectId || firebaseConfig.projectId.includes("YOUR_")) {
    throw new Error("Firebase configuration is missing or incomplete. Please update the `config.ts` file with your project's credentials.");
  }
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  dbInstance = firebase.firestore();
  
  try {
    await dbInstance.enablePersistence();
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence could not be enabled: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence could not be enabled: browser not supported.');
    }
  }
};

export const db = () => dbInstance;

export const setupRecaptchaVerifier = () => {
    // It's important that the reCAPTCHA is rendered in a container that is always
    // present in the DOM.
    return new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA solved");
      }
    });
};

export const signInWithPhoneNumber = (phoneNumber: string, appVerifier: any) => {
    const auth = firebase.auth();
    return auth.signInWithPhoneNumber(phoneNumber, appVerifier);
};

export const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // Use signInWithRedirect as signInWithPopup is not supported in the environment.
    return firebase.auth().signInWithRedirect(provider);
};

// Add a function to handle the result after redirect.
export const getRedirectResult = () => {
    return firebase.auth().getRedirectResult();
};

export const signUpWithEmailPassword = (email: string, password: string) => {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
};

export const signInWithEmailPassword = (email: string, password: string) => {
    return firebase.auth().signInWithEmailAndPassword(email, password);
};

export const onAuthStateChangedListener = (callback: (user: any) => void) => {
    return firebase.auth().onAuthStateChanged(callback);
};

export const handleSignOut = () => {
    firebase.auth().signOut();
};