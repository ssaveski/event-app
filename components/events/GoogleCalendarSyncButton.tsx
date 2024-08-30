import { FC, useContext, useEffect } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { saveUserIsSyncedToFirestore } from "../../services/auth";
import { AuthContext } from "../../store/auth-context";
import { View, StyleSheet, Text, Button } from "react-native";

const GoogleCalendarSyncButton: FC = ({ }) => {
    const { user, isSyncedGoogle, loadingIsSynced } = useContext(AuthContext);

    useEffect(() => {
        GoogleSignin.configure({
            scopes: ['https://www.googleapis.com/auth/calendar'],
            iosClientId: '131165465606-1po8ofr7oeg2epru6nt3767cpv1f9rgr.apps.googleusercontent.com',
        });
    }, []);

    const connectGoogleCalendar = async () => {
        try {
            await GoogleSignin.signIn();

            if (user) {
                await saveUserIsSynced(user.uid);
            } else {
                console.error('No authenticated user found');
            }
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available or outdated');
            } else {
                console.error('Failed to sign in:', error);
            }
        }
    };

    const saveUserIsSynced = async (userId: string) => {
        try {
            await saveUserIsSyncedToFirestore(userId, { userId, isSyncedWithGoogle: true });
        } catch (e) {
            console.error("Can't save tokens", e);
        }
    };

    return (
        <>
            {!isSyncedGoogle && !loadingIsSynced && (
                <Button title={'Google'} onPress={connectGoogleCalendar} />
            )}
            {isSyncedGoogle && (
                <View style={styles.connectedContainer}>
                    <View style={styles.greenDot} />
                    <Text>
                        Google
                    </Text>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    connectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'green',
        marginRight: 8,
    },
});

export default GoogleCalendarSyncButton;
