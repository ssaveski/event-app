import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, {useContext} from "react";
import { Button } from "react-native";
import ProfileScreen from "../screens/ProfileScreen";
import { logout } from "../services/auth";
import DashboardScreen from "../screens/DashboardScreen";
import GoogleCalendarSyncButton from "../components/events/GoogleCalendarSyncButton";
import {AuthContext} from "../store/auth-context";

const Stack = createNativeStackNavigator();

function AuthenticatedStack() {
    const { isSyncedGoogle } = useContext(AuthContext);

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={({ navigation }) => ({
                    headerLeft: () => <GoogleCalendarSyncButton />,
                    headerRight: () => (
                        <Button
                            onPress={() => navigation.navigate("Profile")}
                            title="Profile"
                            color="#000"
                        />
                    ),
                })}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <Button
                            onPress={() => navigation.goBack('Dashboard')}
                            title="Back"
                            color="#000"
                        />
                    ),
                    headerRight: () => (
                        <Button
                            onPress={async () => {
                                await logout(isSyncedGoogle);
                                navigation.navigate("Login");
                            }}
                            title="Logout"
                            color="#000"
                        />
                    ),
                })}
            />
        </Stack.Navigator>
    );
}

export default AuthenticatedStack;
