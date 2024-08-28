import React, { FC } from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';

interface AddEventFabButtonProps {
    onPress: () => void;
}

const AddEventFabButton: FC<AddEventFabButtonProps> = ({ onPress }) => {
    return (
        <TouchableOpacity style={styles.fab} onPress={onPress}>
            <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
    );
}

export default AddEventFabButton;

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007AFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    fabText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    }
});
