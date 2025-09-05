// ------------------------------------------------------------------
// IMPORTANT: PLEASE CONFIGURE YOUR API KEYS HERE
// ------------------------------------------------------------------
// Instructions:
// 1. Get your Firebase project configuration from the Firebase console.
//    (Project Settings -> General -> Your apps -> Web app -> SDK setup and configuration -> Config)
// 2. Get your Google OAuth 2.0 Client ID from the Google Cloud Console.
//    Make sure the Authorized JavaScript origins includes the URL of this app.
//    (APIs & Services -> Credentials -> Create Credentials -> OAuth 2.0 Client ID)
// 3. In the Firebase Authentication console, make sure you have enabled the 
//    following sign-in providers: "Email/Password", "Phone", and "Google".
// 4. If you have enabled App Check in Firebase, create a reCAPTCHA v3 site key in
//    the Google Cloud Console ("reCAPTCHA Enterprise") and add 'localhost' to its list of authorized domains for local testing.
// 5. Replace the placeholder values below with your actual credentials.
// ------------------------------------------------------------------

export const config = {
  // Firebase & Google Cloud Configuration
  firebase: {
    apiKey: "AIzaSyCdJc_Kb-X8WdtXVX9JKl15Jos3XCRr6Aw",
    authDomain: "schedulifyai.firebaseapp.com",
    databaseURL: "https://schedulifyai.firebaseio.com",
    projectId: "schedulifyai",
    storageBucket: "schedulifyai.firebasestorage.app",
    messagingSenderId: "526224065548",
    appId: "1:526224065548:web:dd0c0b3670cba047599a29",
    measurementId: "G-4NZF4M6XRQ"
  },

  // Google Calendar OAuth Configuration
  google: {
    clientId: "422045040177-lvvu0f8iloc3u1ar4jl159m6ebkipj5o.apps.googleusercontent.com",
  },
  
  // Fix: Add App Check configuration to resolve authentication errors when App Check is enabled.
  // This key is used to verify that requests to Firebase are from your authentic app.
  appCheck: {
    // Get this from Google Cloud Console -> "reCAPTCHA Enterprise".
    // Make sure to add 'localhost' to the list of authorized domains for local development.
    recaptchaV3SiteKey: "YOUR_RECAPTCHA_V3_SITE_KEY_HERE",
  },

  // Admin User Configuration (emails should be lowercase)
  adminEmails: [
    "ujjwalkokani099@gmail.com",
    "shitaldhope1989@gmail.com"
  ],
};