import { config } from '../components/config';
// Fix: Replaced direct import from 'firebase/auth' with the centralized User type from '../types'.
import type { User } from '../types';

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
  
  // Fix: Initialize Firebase App Check to resolve 'auth/firebase-app-check-token-is-invalid' error.
  // This is necessary when App Check is enforced in the Firebase project.
  const appCheckConfig = config.appCheck;
  if (appCheckConfig && appCheckConfig.recaptchaV3SiteKey && !appCheckConfig.recaptchaV3SiteKey.includes("YOUR_")) {
      try {
        const appCheck = firebase.appCheck();
        // Activate App Check with the reCAPTCHA v3 provider.
        appCheck.activate(
            new firebase.appCheck.ReCaptchaV3Provider(appCheckConfig.recaptchaV3SiteKey),
            true // Automatic token refreshing.
        );
        console.log("Firebase App Check initialized successfully.");
      } catch(err) {
        console.error("Error initializing Firebase App Check:", err);
      }
  } else {
      console.warn("Firebase App Check is not configured. Please add your reCAPTCHA v3 site key to `config.ts` to enable it.");
  }

  dbInstance = firebase.firestore();
  
  // Fix: Explicitly set Firestore settings to improve connectivity and prevent common data errors.
  // Using long-polling can help bypass network restrictions that block WebSockets.
  try {
    dbInstance.settings({
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
    });
  } catch (err) {
      console.warn("Could not apply Firestore settings, it might have been set already.", err);
  }
  
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

// Fix: Improved type from any to User | null
export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
    return firebase.auth().onAuthStateChanged(callback);
};

export const handleSignOut = () => {
    firebase.auth().signOut();
};

// Fix: Added explicit User return type
export const updateUserProfile = async (profileData: { displayName?: string, photoURL?: string }): Promise<User> => {
    const user = firebase.auth().currentUser;
    if (!user) {
        throw new Error("No authenticated user found to update.");
    }
    await user.updateProfile(profileData);
    // Return a fresh user object to reflect changes immediately
    return firebase.auth().currentUser;
};