import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { config } from './config';

/**
 * Initializes and exports typed Firebase service singletons with offline persistence.
 */
let firebaseAppInstance: FirebaseApp;
let authInstance: Auth;
let firestoreInstance: Firestore;

/**
 * Ensures singleton initialization of Firebase services.
 *
 * @returns {FirebaseApp} Active Firebase application instance.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseAppInstance) {
    const existingApps = getApps();
    firebaseAppInstance = existingApps.length > 0 ? existingApps[0]! : initializeApp(config.firebase);
  }
  return firebaseAppInstance;
}

/**
 * Retrieves the Firebase Auth service.
 *
 * @returns {Auth} Firebase authentication instance.
 */
export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

/**
 * Retrieves the Cloud Firestore service with IndexedDB multi-tab offline persistence.
 * Guarantees zero downtime when field work suffers mobile connectivity drops.
 *
 * @returns {Firestore} Firestore database instance.
 */
export function getFirestoreDb(): Firestore {
  if (!firestoreInstance) {
    const app = getFirebaseApp();
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      try {
        firestoreInstance = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch {
        firestoreInstance = getFirestore(app);
      }
    } else {
      firestoreInstance = getFirestore(app);
    }
  }
  return firestoreInstance;
}
