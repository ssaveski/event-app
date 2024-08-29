import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import firebaseService from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkEmailVerification } from '../utils/checkEmailVerification';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isEmailVerified: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isEmailVerified: false
});

interface AuthContextProviderProps {
    children: ReactNode;
}

function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const auth = firebaseService.getAuth();

    useEffect(() => {
        loadUserFromStorage();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setIsEmailVerified(firebaseUser.emailVerified);
                await AsyncStorage.setItem('user', JSON.stringify(firebaseUser.toJSON()));
            } else {
                setUser(null);
                setIsEmailVerified(false);
                await AsyncStorage.removeItem('user');
            }
            setLoading(false);

            checkEmailVerification(auth, (emailVerified) => {
                setIsEmailVerified(emailVerified);
            });
        });

        return () => unsubscribe();
    }, [auth]);


    const loadUserFromStorage = async () => {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
            const userData = JSON.parse(userJson);
            setUser(userData);
            setIsEmailVerified(userData.emailVerified || false);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isEmailVerified }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
