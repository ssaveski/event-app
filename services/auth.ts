import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateEmail as firebaseUpdateEmail,
    updatePassword as firebaseUpdatePassword,
    signOut as firebaseSignOut,
    sendEmailVerification,
    User,
} from 'firebase/auth';
import firebaseService from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    doc,
    updateDoc,
    getDoc,
    setDoc,
    onSnapshot, DocumentData,
} from "firebase/firestore";
import firebase from "firebase/compat";
import FirestoreError = firebase.firestore.FirestoreError;
import {GoogleSignin} from "@react-native-google-signin/google-signin";

const firebaseAuth = firebaseService.getAuth();
const firebaseDb = firebaseService.getDB();


export async function signIn(email: string, password: string) {
    const response = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return response.user;
}

export async function signUp(email: string, password: string) {
    const response = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return response.user;
}

export async function updateEmail(newEmail: string, user: User) {
   return await firebaseUpdateEmail(user, newEmail);
}

export async function updatePassword(newPassword: string, user: User) {
    return await firebaseUpdatePassword(user, newPassword);
}

export async function sendVerificationEmail(user: any) {
    return await sendEmailVerification(user);
}

export async function saveUserIsSyncedToFirestore(userId: string, data: { [key: string]: any }) {
    const userDocRef = doc(firebaseDb, 'users', userId);

    const docSnapshot = await getDoc(userDocRef);

    if (!docSnapshot.exists()) {
        await setDoc(userDocRef, data);
    } else {
        await updateDoc(userDocRef, {
            ...userDocRef,
            ...data
        });
    }
}

export async function logout() {
    await saveUserIsSyncedToFirestore(firebaseAuth.currentUser.uid, { isSyncedWithGoogle: false });
    await firebaseSignOut(firebaseAuth);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('events');

    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
}


export function subscribeToUsers(
    userId: string,
    callback: (user: DocumentData | undefined) => void,
) {
    const userDocRef = doc(firebaseDb, "users", userId);

    return onSnapshot(
        userDocRef,
        async (docSnapshot) => {
            return callback(docSnapshot.data());
        },
        (error: FirestoreError) => {
            console.error("Error fetching user data:", error);
        }
    );
}