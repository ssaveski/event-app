import React, {useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'react-native';
import AuthContextProvider, {AuthContext} from './store/auth-context';
import AuthStack from './navigation/AuthStack';
import AuthenticatedStack from './navigation/AuthenticatedStack';

SplashScreen.preventAutoHideAsync();

function Navigation() {
    const {user} = useContext(AuthContext);
    return (
        <NavigationContainer>
            {user ? <AuthenticatedStack/> : <AuthStack/>}
        </NavigationContainer>
    );
}

function Root() {
    const {loading} = useContext(AuthContext);

    useEffect(() => {
        async function initializeApp() {
            await SplashScreen.hideAsync();
        }

        initializeApp();
    }, []);

    if (loading) {
        return null;
    }

    return <Navigation/>;
}

export default function App() {
    return (
        <>
            <StatusBar style="light"/>
            <AuthContextProvider>
                <Root/>
            </AuthContextProvider>
        </>
    );
}
