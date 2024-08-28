import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HourBlocks = () => {
    const hours = Array.from({ length: 24 }, (_, index) => index);

    return (
        <>
            {hours.map(hour => (
                <View key={hour} style={styles.hourBlock}>
                    <Text style={styles.hourText}>{`${hour}:00`}</Text>
                </View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    hourBlock: {
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        justifyContent: 'center',
    },
    hourText: {
        fontSize: 12,
        color: '#999',
    },
});

export default HourBlocks;
