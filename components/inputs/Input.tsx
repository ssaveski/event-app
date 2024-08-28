import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ValidationRules } from "../../utils/validations";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InputProps {
    name: string;
    value: string;
    onChangeText: (name: string, value: string) => void;
    rules?: ValidationRules;
    textProps?: TextInputProps;
    icon?: React.ReactNode;
}

export interface InputRef {
    validate: () => boolean;
}

const Input = forwardRef<InputRef, InputProps>(({
                                                    name,
                                                    value,
                                                    onChangeText,
                                                    rules = [],
                                                    textProps,
                                                    icon,
                                                }, ref) => {
    const [error, setError] = useState<string | undefined>();

    const validate = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        for (const rule of rules) {
            if (!rule.validate(value)) {
                setError(rule.message);
                return false;
            }
        }
        setError(undefined);
        return true;
    };

    useImperativeHandle(ref, () => ({
        validate
    }));

    const handleChange = (text: string) => {
        onChangeText(name, text);
        if (error) {
            validate();
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={[styles.container, error ? styles.invalidContainer : undefined]}>
                {icon}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={handleChange}
                    {...textProps}
                />
            </View>
            <View style={styles.errorContainer}>
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    invalidContainer: {
        borderColor: 'red',
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    errorContainer: {
        minHeight: 20,
        justifyContent: 'flex-start',
    },
    errorText: {
        color: 'red',
        marginLeft: 10,
        marginTop: 5,
        fontSize: 12, // Adjust as needed
    },
});

export default Input;