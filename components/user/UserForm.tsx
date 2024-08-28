import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import Input, { InputRef } from '../inputs/Input';
import Button from '../ui/Button';
import { useFormValidation } from "../inputs/useFormValidation";
import { isRequired } from "../../utils/validations";

interface UserFormProps {
    formData: {
        email: string;
        newPassword: string;
        confirmNewPassword: string;
    };
    loading: boolean;
    onChange: (name: string, value: string) => void;
    onSubmit: () => void;
}

const UserForm: FC<UserFormProps> = ({ formData, onChange, onSubmit, loading }) => {
    const { register, isFormValid } = useFormValidation();

    const handleInputChange = (name: string, value: string) => {
        onChange(name, value);
    };

    const handleSubmit = () => {
        if (!isFormValid() || loading) {
            return;
        }

        onSubmit();
    }

    const validatePasswords = (password: string, newPassword: string) => {
        return password === newPassword;
    };

    return (
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
            />
            <Input
                ref={(ref: InputRef) => register('newPassword', ref)}
                name="newPassword"
                value={formData.newPassword}
                onChangeText={handleInputChange}
                rules={[
                    {
                        validate: (value) => validatePasswords(value, formData.confirmNewPassword),
                        message: 'Passwords must match'
                    }
                ]}
                textProps={{
                    placeholder: 'New Password',
                    secureTextEntry: true,
                    autoComplete: 'off'
                }}
            />
            <Input
                ref={(ref: InputRef) => register('confirmNewPassword', ref)}
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChangeText={handleInputChange}
                rules={[
                    {
                        validate: (value) => validatePasswords(value, formData.newPassword),
                        message: 'Passwords must match'
                    }
                ]}
                textProps={{
                    placeholder: 'Confirm New Password',
                    secureTextEntry: true,
                    autoComplete: 'off'
                }}
            />
            <Button primary onPress={handleSubmit} style={styles.saveButton} loading={loading}>
                Save Changes
            </Button>
        </>
    );
};

const styles = StyleSheet.create({
    saveButton: {
        marginTop: 20,
    },
});

export default UserForm;
