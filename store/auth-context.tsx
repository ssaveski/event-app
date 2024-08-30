import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import firebaseService from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkEmailVerification } from '../utils/checkEmailVerification';
import { subscribeToUsers } from '../services/auth';
import { DocumentData } from 'firebase/firestore';
import { syncGoogleCalendar } from '../services/googleCalendar';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isEmailVerified: boolean;
    isSyncedGoogle: boolean;
    loadingIsSynced: boolean;
    operationInProgress: boolean;
    setOperationInProgress: (inProgress: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    loadingIsSynced: true,
    isEmailVerified: false,
    isSyncedGoogle: false,
    operationInProgress: false,
    setOperationInProgress: () => {},  // Default implementation to avoid errors
});

interface AuthContextProviderProps {
    children: ReactNode;
}

function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isSyncedGoogle, setIsSyncedGoogle] = useState(false);
    const [loadingIsSynced, setLoadingIsSynced] = useState(true);
    const [operationInProgress, setOperationInProgress] = useState(false);

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
        });

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        if (user?.uid) {
            const cleanup = checkEmailVerification(auth, (emailVerified) => {
                setIsEmailVerified(emailVerified);
            });

            return cleanup;
        }
    }, [user?.uid]);

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = subscribeToUsers(user.uid, (user) => setUserGoogleSync(user));

            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }
    }, [user?.uid]);

    useEffect(() => {
        let syncInterval: number | undefined;
        if (user?.uid && isSyncedGoogle) {
            syncGoogleCalendar(user.uid);
            syncInterval = setInterval(() => {
                if (!operationInProgress) {
                    syncGoogleCalendar(user.uid);
                }
            }, 10000);
        }

        return () => {
            if (syncInterval) {
                clearInterval(syncInterval);
            }
        };
    }, [user?.uid, isSyncedGoogle, operationInProgress]);

    const setUserGoogleSync = (user: DocumentData | undefined) => {
        setIsSyncedGoogle(!!user?.isSyncedWithGoogle);
        setLoadingIsSynced(false);
    }

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
        <AuthContext.Provider value={{ user, loading, isEmailVerified, isSyncedGoogle, loadingIsSynced, operationInProgress, setOperationInProgress: setOperationInProgress }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
