import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateEmail as firebaseUpdateEmail,
    updatePassword as firebaseUpdatePassword,
    signOut as firebaseSignOut,
    sendEmailVerification,
    User
} from 'firebase/auth';
import firebaseService from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseAuth = firebaseService.getAuth();

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

export async function logout() {
    await firebaseSignOut(firebaseAuth);
    await AsyncStorage.removeItem('user');
}
