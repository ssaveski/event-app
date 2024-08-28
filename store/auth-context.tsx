import React, {createContext, useState, useEffect, ReactNode} from 'react';
import {onAuthStateChanged, User} from 'firebase/auth';
import firebaseService from '../firebaseConfig';
import {checkEmailVerification} from '../utils/checkEmailVerification';

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

function AuthContextProvider({children}: AuthContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const auth = firebaseService.getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsEmailVerified(firebaseUser?.emailVerified ?? false);
            setLoading(false);

            checkEmailVerification(auth, (emailVerified) => {
                setIsEmailVerified(emailVerified);
            });
        });

        return () => unsubscribe();
    }, [auth]);

    return (
        <AuthContext.Provider value={{user, loading, isEmailVerified}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
