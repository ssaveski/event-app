import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Button } from "react-native";
import ProfileScreen from "../screens/ProfileScreen";
import { logout } from "../services/auth";
import DashboardScreen from "../screens/DashboardScreen";

const Stack = createNativeStackNavigator();

function AuthenticatedStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={({ navigation }) => ({
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
                                await logout();
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
