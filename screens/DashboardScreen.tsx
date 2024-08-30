import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import EventItem from '../components/events/EventItem';
import { addEvent, updateEvent, subscribeToEvents } from "../services/events";
import { AuthContext } from "../store/auth-context";
import EventForm from "../components/events/EventForm";
import { isSameDay, format } from 'date-fns';
import HourBlocks from "../components/events/HourBlocks";
import AddEventFabButton from "../components/events/AddEventFabButton";
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [markedDates, setMarkedDates] = useState<any>({});
    const [selectedCalendarDates, setSelectedCalendarDates] = useState<any>({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const { user, isSyncedGoogle, setOperationInProgress } = useContext(AuthContext);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);

    useEffect(() => {
        loadEventsFromStorage();
    }, []);

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = subscribeToEvents(user.uid, handleEventsUpdate);
            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }
    }, [user?.uid]);

    useEffect(() => {
        updateSelectedCalendarDates();
    }, [selectedDate]);

    useEffect(() => {
        filterEventsByDate();
    }, [selectedDate, events]);

    const loadEventsFromStorage = async () => {
        try {
            const storedEvents = await AsyncStorage.getItem('events');
            if (storedEvents) {
                const parsedEvents = JSON.parse(storedEvents);
                setEvents(parsedEvents);
                setMarkedDates(generateMarkedDates(parsedEvents));
            }
            setLoadingCalendar(false);
        } catch (error) {
            console.error('Failed to load events from AsyncStorage', error);
            setLoadingCalendar(false);
        }
    };

    const handleEventsUpdate = (newEvents: any[]) => {
        setEvents(newEvents);
        setMarkedDates(generateMarkedDates(newEvents));
        saveEventsToStorage(newEvents);
        setLoadingCalendar(false);
    };

    const generateMarkedDates = (events: any[]) => {
        return events.reduce((acc, event) => {
            const date = format(new Date(event.start.dateTime), 'yyyy-MM-dd');
            acc[date] = { marked: true };
            return acc;
        }, {});
    };

    const saveEventsToStorage = async (events: any[]) => {
        try {
            await AsyncStorage.setItem('events', JSON.stringify(events));
        } catch (error) {
            console.error('Failed to save events to AsyncStorage', error);
        }
    };

    const updateSelectedCalendarDates = () => {
        if (selectedDate) {
            setSelectedCalendarDates({
                [selectedDate]: { selected: true, selectedColor: 'blue' },
            });
        }
    };

    const filterEventsByDate = () => {
        if (!selectedDate) {
            setFilteredEvents([]);
        } else {
            const filtered = events.filter(e => checkTime(new Date(e.start.dateTime), new Date(selectedDate)));
            setFilteredEvents(filtered);
        }
    };

    const checkTime = (startDate: Date, endDate: Date) => isSameDay(startDate, endDate);

    const handleDayPress = (day: any) => {
        setSelectedDate(prevDate => prevDate === day.dateString ? '' : day.dateString);
    };

    const handleAddEvent = () => {
        setCurrentEvent(null);
        setIsModalVisible(true);
    };

    const handleEditEvent = (event: any) => {
        setCurrentEvent({
            ...event,
            startDateTime: event.start.dateTime,
            endDateTime: event.end.dateTime,
        });
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleFormSubmit = async (formData: any) => {
        if (!user) return;

        try {
            setOperationInProgress(true);
            setLoadingForm(true);
            const eventData = {
                userId: user.uid,
                title: formData.title,
                start: { dateTime: formData.startDateTime },
                end: { dateTime: formData.endDateTime },
            };

            if (currentEvent) {
                await updateEvent({ ...currentEvent, ...eventData }, isSyncedGoogle);
                Alert.alert('Event updated', 'Event updated successfully!');
            } else {
                await addEvent(eventData, isSyncedGoogle);
                Alert.alert('Event added', 'Event added successfully!');
            }

            setIsModalVisible(false);
        } catch (error) {
            Alert.alert('Error', `Failed to ${currentEvent ? 'update' : 'add'} event. Please try again.`);
        } finally {
            setLoadingForm(false);
            setOperationInProgress(false);
        }
    };

    const renderEventCards = () => {
        return filteredEvents.map(event => (
            <EventItem
                key={event.id}
                event={event}
                onEdit={handleEditEvent}
            />
        ));
    };

    return (
        <View style={styles.container}>
            <Calendar
                displayLoadingIndicator={loadingCalendar}
                onDayPress={handleDayPress}
                markedDates={{ ...markedDates, ...selectedCalendarDates }}
            />
            <ScrollView style={styles.scheduleContainer}>
                <HourBlocks />
                {renderEventCards()}
            </ScrollView>
            <AddEventFabButton onPress={handleAddEvent} />
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <EventForm
                            loading={loadingForm}
                            initialData={currentEvent}
                            onSubmit={handleFormSubmit}
                            isEdit={!!currentEvent}
                        />
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scheduleContainer: {
        flex: 1,
        padding: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        maxHeight: '80%',
        flex: 1,
    },
    closeButton: {
        alignSelf: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: '#000',
        fontSize: 16,
    }
});

export default DashboardScreen;
