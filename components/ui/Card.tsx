import React, { FC, ReactNode } from 'react';
import {StyleSheet, View} from 'react-native';

interface CardProps {
    children: ReactNode;
}

const Card: FC<CardProps> = ({ children }) => {
    return (
        <View style={styles.card}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 20,
    }
});

export default Card;
