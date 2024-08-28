import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle, Alert, ActivityIndicator} from 'react-native';
import {deleteEvent, Event} from '../../services/events';
import { format } from 'date-fns';
import {MaterialIcons} from "@expo/vector-icons";

interface EventItemProps {
    event: Event;
    onEdit: (event: Event) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onEdit }) => {
    const [loading, setLoading] = useState(false);
    const handlePress = () => {
        onEdit(event);
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await deleteEvent(event);
        } catch (e) {
            Alert.alert('Error', `Failed to delete event. Please try again.`);
        } finally {
            setLoading(false);
        }
    }


    const calculateEventStyle = (start: Date, end: Date): { top: number; height: number } => {
        const startTime = start.getHours() + start.getMinutes() / 60;
        const endTime = end.getHours() + end.getMinutes() / 60;
        const top = startTime * 60; // Each hour block is 60px high
        const height = Math.max((endTime - startTime) * 60, 50); // Ensure minimum height of 50px

        return {
            top,
            height,
        };
    };

    return (
        <TouchableOpacity onPress={handlePress} style={[styles.container, calculateEventStyle(event.start.dateTime, event.end.dateTime)]}>
            <View style={styles.row}>
                <View>
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{event.title}</Text>
                    <Text style={styles.time}>
                        {format(event.start.dateTime, 'HH:mm')} - {format(event.end.dateTime, 'HH:mm')}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleDelete}>
                    {!loading ? <MaterialIcons name="close" color="#3333" size={24}/> : <ActivityIndicator color="#3333" size={24}/>}
                </TouchableOpacity>
            </View>

        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 60,
        right: 0,
        padding: 8,
        backgroundColor: '#e6f2ff',
        borderRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        minHeight: 50,
        justifyContent: 'center',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        overflow: 'hidden',
        maxWidth: 100
    },
    time: {
        fontSize: 12,
        color: '#666',
    },
});

export default EventItem;