import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, Firestore } from "firebase/firestore";

class FirebaseService {
    private static instance: FirebaseService | null = null;
    private app: FirebaseApp;
    private auth: Auth;
    private db: Firestore;

    private constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyD9isKCNsY-MWyktZ7leKs8Q7FPl0d0ckc",
            authDomain: "event-app-792e7.firebaseapp.com",
            projectId: "event-app-792e7",
            storageBucket: "event-app-792e7.appspot.com",
            messagingSenderId: "952393361878",
            appId: "1:952393361878:web:61703da6bae58e2d6c1c77"
        };

        if (getApps().length === 0) {
            this.app = initializeApp(firebaseConfig);
            initializeAuth(this.app, {
                persistence: getReactNativePersistence(ReactNativeAsyncStorage)
            });
        } else {
            this.app = getApps()[0];
        }

        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
    }

    public static getInstance(): FirebaseService {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }

    public getApp(): FirebaseApp {
        return this.app;
    }

    public getAuth(): Auth {
        return this.auth;
    }

    public getDB(): Firestore {
        return this.db;
    }
}

const firebaseService = FirebaseService.getInstance();
export default firebaseService;