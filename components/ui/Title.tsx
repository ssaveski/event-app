import React, { FC, ReactNode } from 'react';
import { Text, StyleSheet } from 'react-native';

interface TitleProps {
    children: ReactNode;
}

const Title: FC<TitleProps> = ({ children }) => {
    return (
        <Text style={styles.title}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 40,
        textAlign: 'center',
    },
});

export default Title;
