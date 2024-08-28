import React, { FC, ReactNode } from 'react';
import { Pressable, Text, StyleSheet, GestureResponderEvent, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    children: ReactNode;
    primary?: boolean;
    outlined?: boolean;
    loading?: boolean;
    small?: boolean;
    disabled?: boolean; // New prop for disabled state
}

const Button: FC<ButtonProps> = ({ onPress, children, primary = false, outlined = false, loading = false, small = false, disabled = false }) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                primary && styles.primary,
                outlined && styles.outlined,
                pressed && !loading && !disabled && styles.pressed,  // Apply pressed style if not loading and not disabled
                small && styles.small,  // Apply small style when the small prop is true
            ]}
            onPress={disabled ? undefined : onPress}  // Disable button click functionality
            disabled={disabled || loading}  // Disable button when disabled or loading
        >
            <View style={styles.buttonContent}>
                {loading ? (
                    <ActivityIndicator size="small" color={primary ? '#fff' : '#5568FE'} />  // Spinner color based on button type
                ) : (
                    <Text style={[
                        styles.text,
                        outlined && styles.outlinedText,
                        !outlined && primary && styles.primaryText,
                        small && styles.smallText  // Apply small text style when the small prop is true
                    ]}>
                        {children}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

export default Button;

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    primary: {
        backgroundColor: '#5568FE',
    },
    outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#5568FE',
    },
    pressed: {
        opacity: 0.75,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    outlinedText: {
        color: '#5568FE',
    },
    primaryText: {
        color: '#fff',
    },
    small: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5
    },
    smallText: {
        fontSize: 14
    },
});
