import admin from "firebase-admin";

let initialized = false;
let warnedMissingConfig = false;

const getPrivateKey = () => {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
};

export const initFirebaseAdmin = () => {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return true;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    if (!warnedMissingConfig) {
      const missing = [
        !projectId ? "FIREBASE_PROJECT_ID" : null,
        !clientEmail ? "FIREBASE_CLIENT_EMAIL" : null,
        !privateKey ? "FIREBASE_PRIVATE_KEY" : null,
      ].filter(Boolean);
      console.warn(
        `Firebase Admin non configure. Variables manquantes: ${missing.join(", ")}. Les notifications push hors-app ne fonctionneront pas.`,
      );
      warnedMissingConfig = true;
    }
    return false;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
  console.log("Firebase Admin initialise avec succes.");
  return true;
};

export const getFirebaseMessaging = () => {
  if (!initFirebaseAdmin()) {
    return null;
  }

  return admin.messaging();
};
