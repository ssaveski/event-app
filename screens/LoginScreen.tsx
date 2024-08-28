import React, { useState, useEffect, useCallback, FC } from 'react';
import { View, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialIcons } from '@expo/vector-icons';
import Title from '../components/ui/Title';
import Button from '../components/ui/Button';
import Input, { InputRef } from '../components/inputs/Input';
import { isRequired } from "../utils/validations";
import { useFormValidation } from "../components/inputs/useFormValidation";
import { signIn, signUp } from "../services/auth";

interface FormData {
    [key: string]: string;
}

const LoginScreen: FC = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const { register, isFormValid } = useFormValidation();

    useEffect(() => {
        checkBiometricAuth();
    }, []);

    const checkBiometricAuth = async () => {
        const hasBiometricHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasBiometricHardware && isEnrolled) {
            const savedEmail = await SecureStore.getItemAsync('userEmail');
            const savedPassword = await SecureStore.getItemAsync('userPassword');

            if (savedEmail && savedPassword) {
                Alert.alert(
                    'Biometric Sign In',
                    'Would you like to sign in using biometrics?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                        {
                            text: 'Sign In',
                            onPress: () => handleBiometricSignIn(savedEmail, savedPassword),
                        },
                    ]
                );
            }
        }
    };

    const handleBiometricSignIn = async (email: string, password: string) => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to sign in',
            fallbackLabel: 'Use passcode',
        });

        if (result.success) {
            setLoading(true);
            try {
                await signIn(email, password);
            } catch (error) {
                alert('Biometric login failed');
            } finally {
                setLoading(false);
            }
        } else {
            alert('Biometric authentication cancelled');
        }
    };

    async function loginUser() {
        try {
            setLoading(true);
            await signIn(formData.email, formData.password);
            await SecureStore.setItemAsync('userEmail', formData.email);
            await SecureStore.setItemAsync('userPassword', formData.password);
        } catch (error) {
            alert('Login failed');
            console.log("Login failed", error.message);
        } finally {
            setLoading(false);
        }
    }

    async function registerUser() {
        try {
            setLoading(true);
            await signUp(formData.email, formData.password);
        } catch (error) {
            alert('Register failed');
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (name: string, value: string) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = useCallback((isLogin: boolean) => {
        if (isFormValid()) {
            if (isLogin) {
                loginUser();
            } else {
                registerUser();
            }
        }
    }, [formData, isFormValid]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inner}
                >
                    <Title>Event App</Title>
                    {loading ? (
                        <ActivityIndicator size="large" color="#5568FE" />
                    ) : (
                        <>
                            <Input
                                ref={(ref: InputRef) => register('email', ref)}
                                name="email"
                                value={formData.email}
                                onChangeText={handleInputChange}
                                rules={[{
                                    validate: isRequired,
                                    message: 'Email is required'
                                }]}
                                textProps={{
                                    placeholder: 'Email',
                                    autoCapitalize: 'none'
                                }}
                                icon={<MaterialIcons name='person' size={24} color='#333' />}
                            />
                            <Input
                                ref={(ref: InputRef) => register('password', ref)}
                                name="password"
                                value={formData.password}
                                onChangeText={handleInputChange}
                                rules={[{
                                    validate: isRequired,
                                    message: 'Password is required'
                                }]}
                                textProps={{
                                    placeholder: 'Password',
                                    secureTextEntry: true
                                }}
                                icon={<MaterialIcons name='lock' size={24} color='#333' />}
                            />
                            <Button primary onPress={() => handleSubmit(true)}>
                                Login
                            </Button>
                            <Button primary onPress={() => handleSubmit(false)}>
                                Register
                            </Button>
                        </>
                    )}
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fc',
        justifyContent: 'flex-start',
        padding: 20
    },
    inner: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 20,
        paddingTop: 100
    },
});

export default LoginScreen;