import React, { FC, useState } from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface UserCardProps {
    email: string;
    creationTime: string;
    lastSignInTime: string;
    isEditing: boolean;
    onEdit: () => void;
    onCloseEdit: () => void;
    isEmailVerified: boolean;
    onSendVerificationEmail: () => void;
}

const UserCard: FC<UserCardProps> = ({
                                         email,
                                         creationTime,
                                         lastSignInTime,
                                         isEditing,
                                         onEdit,
                                         onCloseEdit,
                                         isEmailVerified,
                                         onSendVerificationEmail
                                     }) => {
    const [isVerificationSent, setIsVerificationSent] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleSendVerificationEmail = async () => {
        await onSendVerificationEmail();
        setIsVerificationSent(true);
    };

    return (
        <Card>
            <Text style={styles.userInfo}>
                <Text style={styles.label}>Email:</Text> {email}
            </Text>
            <Text style={styles.userInfo}>
                <Text style={styles.label}>Joined:</Text> {formatDate(creationTime)}
            </Text>
            <Text style={styles.userInfo}>
                <Text style={styles.label}>Last Updated:</Text> {formatDate(lastSignInTime)}
            </Text>
            {!isEmailVerified ? (
                <View style={styles.verificationContainer}>
                    <Text style={styles.verificationText}>
                        You need to verify your email to be able to edit the email and password.
                    </Text>
                    <Button onPress={handleSendVerificationEmail} style={styles.verificationButton}  primary={true}>
                        {isVerificationSent ? 'Resend verification email' : 'Send verification email'}
                    </Button>
                </View>
            ) : !isEditing ? (
                <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                    <FontAwesome name="edit" size={16} color="#0066cc" />
                    <Text style={styles.editText}> Edit</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={onCloseEdit} style={styles.closeButton}>
                    <FontAwesome name="times" size={16} color="#cc0000" />
                    <Text style={styles.closeText}> Close Edit</Text>
                </TouchableOpacity>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    userInfo: {
        fontSize: 16,
        marginBottom: 10,
    },
    label: {
        fontWeight: 'bold',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    editText: {
        color: '#0066cc',
        fontSize: 16,
    },
    closeText: {
        color: '#cc0000',
        fontSize: 16,
    },
    verificationContainer: {
        marginTop: 10,
    },
    verificationText: {
        fontSize: 16,
        color: '#cc0000',
    },
    verificationButton: {
        marginTop: 10,
        backgroundColor: '#0066cc', // Adjust based on your button styles
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    resendText: {
        marginTop: 10,
        fontSize: 14,
        color: '#0066cc',
    },
});

export default UserCard;
