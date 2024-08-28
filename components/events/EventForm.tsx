import React, {FC, useCallback, useEffect, useState} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import Input, {InputRef} from '../inputs/Input';
import Button from '../ui/Button';
import {isDateAfter, isRequired} from "../../utils/validations";
import {useFormValidation} from "../inputs/useFormValidation";
import InputDateTimePicker from "../inputs/InputDatePicker";

interface EventFormProps {
    initialData?: FormData;
    onSubmit: (data: FormData) => void;
    isEdit: boolean;
    loading: boolean;
}

interface FormData {
    title: string;
    startDateTime: Date;
    endDateTime: Date;
}

const EventForm: FC<EventFormProps> = ({ initialData, onSubmit, isEdit, loading }) => {
    const { register, isFormValid } = useFormValidation();
    const [formData, setFormData] = useState<FormData>({
        title: initialData?.title ?? '',
        startDateTime: initialData?.startDateTime ?? new Date(),
        endDateTime: initialData?.endDateTime ?? calculateEndDateTime(new Date()),
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleInputChange = (name: string, value: string | Date) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleSubmit = useCallback(() => {
        if (isFormValid()) {
            onSubmit(formData);
        }
    }, [formData, isFormValid, onSubmit]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inner}
                >
                    <Text>Name: </Text>
                    <Input
                        ref={(ref: InputRef) => register('title', ref)}
                        name="title"
                        value={formData.title}
                        onChangeText={handleInputChange}
                        rules={[{
                            validate: isRequired,
                            message: 'Name is required'
                        }]}
                        textProps={{
                            placeholder: 'Name',
                            autoCapitalize: 'none'
                        }}
                        icon={<MaterialIcons name='person' size={24} color='#333' />}
                    />
                    <Text>From: </Text>
                    <InputDateTimePicker
                        ref={(ref: InputRef) => register('startDateTime', ref)}
                        name="startDateTime"
                        value={formData.startDateTime}
                        onChangeDate={handleInputChange}
                        icon={<MaterialIcons name='calendar-today' size={24} color='#333' />}
                        rules={[{
                            validate: isRequired,
                            message: 'Start time is required'
                        }]}
                    />
                    <Text>To: </Text>
                    <InputDateTimePicker
                        ref={(ref: InputRef) => register('endDateTime', ref)}
                        name="endDateTime"
                        value={formData.endDateTime}
                        onChangeDate={handleInputChange}
                        icon={<MaterialIcons name='calendar-today' size={24} color='#333' />}
                        rules={[{
                            validate: isRequired,
                            message: 'End time is required'
                        },
                            {
                                validate: (value) => isDateAfter(formData.startDateTime, value),
                                message: 'Ending time should be later than start time'
                            }]}
                    />
                    <Button primary onPress={handleSubmit} loading={loading}>
                        {isEdit ? 'Update Event' : 'Add Event'}
                    </Button>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};


const calculateEndDateTime = (startDateTime: Date): Date => {
    return new Date(startDateTime.getTime() + 15 * 60000);
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fc',
        justifyContent: 'flex-start',
        padding: 20,
    },
    inner: {
        flex: 1,
        justifyContent: 'flex-start',
    },
});

export default EventForm;
