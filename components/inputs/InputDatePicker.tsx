import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, LayoutAnimation } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ValidationRules } from '../../utils/validations';

interface DateTimePickerInputProps {
    name: string;
    value: Date;
    onChangeDate: (name: string, value: Date) => void;
    rules?: ValidationRules;
    icon?: React.ReactNode;
}

export interface DateTimePickerInputRef {
    validate: () => boolean;
}

const DateTimePickerInput = forwardRef<DateTimePickerInputRef, DateTimePickerInputProps>(({
                                                                                              name,
                                                                                              value,
                                                                                              onChangeDate,
                                                                                              rules = [],
                                                                                              icon,
                                                                                          }, ref) => {
    const [dateTime, setDateTime] = useState(value);
    const [error, setError] = useState<string | undefined>();

    const validate = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        for (const rule of rules) {
            if (!rule.validate(dateTime)) {
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

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || dateTime;
        setDateTime(currentDate);
        console.log(currentDate, selectedDate, dateTime);
        onChangeDate(name, currentDate);

        if (error) {
            validate();
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {icon}
                <View style={styles.input}>
                    <DateTimePicker
                        value={dateTime}
                        mode="datetime"
                        display="default"
                        onChange={handleChange}
                    />
                </View>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
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
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    errorText: {
        color: 'red',
        marginTop: 5,
    },
});

export default DateTimePickerInput;
