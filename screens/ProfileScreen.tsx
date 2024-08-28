import React, { useState, useCallback, FC, useContext } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { AuthContext } from '../store/auth-context';
import { updateEmail, updatePassword, sendVerificationEmail } from '../services/auth';
import UserCard from "../components/user/UserCard";
import UserForm from "../components/user/UserForm";

interface FormData {
    email: string;
    newPassword: string;
    confirmNewPassword: string;
}

const ProfileScreen: FC = () => {
    const { user, isEmailVerified } = useContext(AuthContext);
    const initialData: FormData = {
        email: user?.email ?? '',
        newPassword: '',
        confirmNewPassword: '',
    };

    const [formData, setFormData] = useState<FormData>(initialData);
    const [initialFormData, setInitialFormData] = useState<FormData>(initialData);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (name: string, value: string) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = useCallback(async () => {
        try {
            if (!user?.emailVerified && formData.email !== user?.email) {
                Alert.alert('Email not verified', 'You must verify your email before changing it.');
                return;
            }
            setLoading(true);
            if (user?.email && formData.email !== user.email) {
                await updateEmail(formData.email, user);
            }
            if (formData.newPassword?.length) {
                await updatePassword(formData.newPassword, user);
                handleInputChange('newPassword', '');
                handleInputChange('confirmNewPassword', '');
            }
            Alert.alert('Success', 'Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Update failed', error?.message || 'An error occurred while updating profile.');
        } finally {
            setLoading(false);
        }
    }, [formData, user]);

    const handleEdit = () => {
        setInitialFormData(formData);
        setIsEditing(true);
    };

    const handleCloseEdit = () => {
        setFormData(initialFormData);
        setIsEditing(false);
    };

    const handleSendVerificationEmail = async () => {
        try {
            if (user) {
                await sendVerificationEmail(user);
                Alert.alert('Verification Email Sent', 'Please check your email to verify your account.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while sending the verification email.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    style={{ flex: 1 }} // Ensures ScrollView uses full available space
                >
                    <View style={styles.inner}>
                        <UserCard
                            email={user?.email ?? ''}
                            creationTime={user?.metadata.creationTime ?? ''}
                            lastSignInTime={user?.metadata.lastSignInTime ?? ''}
                            isEmailVerified={isEmailVerified ?? false}
                            isEditing={isEditing}
                            onEdit={handleEdit}
                            onCloseEdit={handleCloseEdit}
                            onSendVerificationEmail={handleSendVerificationEmail}
                        />
                        {isEditing && (
                            <UserForm
                                loading={loading}
                                formData={formData}
                                onChange={handleInputChange}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fc',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    inner: {
        flex: 1,
        justifyContent: 'flex-start',
    },
});

export default ProfileScreen;
