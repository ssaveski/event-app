import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import EventItem from '../components/events/EventItem';
import { addEvent, updateEvent, subscribeToEvents } from "../services/events";
import { AuthContext } from "../store/auth-context";
import EventForm from "../components/events/EventForm";
import { isSameDay, format } from 'date-fns';
import HourBlocks from "../components/events/HourBlocks";
import AddEventFabButton from "../components/events/AddEventFabButton";

const DashboardScreen = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [markedDates, setMarkedDates] = useState({});
    const [selectedCalendarDates, setSelectedCalendarDates] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const { user } = useContext(AuthContext);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);

    useEffect(() => {
        let unsubscribe;

        if (user?.uid) {
            unsubscribe = subscribeToEvents(user.uid, (newEvents) => {
                setEvents(newEvents);
                const dates = newEvents.reduce((acc, event) => {
                    const date = format(event.start.dateTime, 'yyyy-MM-dd');
                    acc[date] = { marked: true };
                    return acc;
                }, {});
                setMarkedDates(dates);

                setLoadingCalendar(false);
            });
        } else {
            setEvents([]);
            setMarkedDates({});
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user?.uid]);

    useEffect(() => {
        if (selectedDate) {
            setSelectedCalendarDates({
                [selectedDate]: { selected: true, selectedColor: 'blue' },
            });
        }
    }, [selectedDate]);

    useEffect(() => {
        if (!selectedDate) {
            return setFilteredEvents([]);
        } else {
            const filtered = events.filter(e => checkTime(e.start.dateTime, new Date(selectedDate)));
            setFilteredEvents(filtered);
        }
    }, [selectedDate, events]);

    const handleDayPress = (day) => {
        setSelectedDate((prevDate) => {
            if (prevDate === day.dateString) {
                return '';
            }
            return day.dateString;
        });
    };

    const handleAddEvent = () => {
        setCurrentEvent(null);
        setIsModalVisible(true);
    };

    const handleEditEvent = (event) => {
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

    const handleFormSubmit = async (formData) => {
        if (!user) {
            return;
        }

        try {
            setLoadingForm(true);
            if (currentEvent) {
                const updatedEvent = {
                    id: currentEvent.id,
                    userId: currentEvent.userId,
                    title: formData.title,
                    start: {
                        dateTime: formData.startDateTime,
                    },
                    end: {
                        dateTime: formData.endDateTime,
                    },
                };
                await updateEvent(updatedEvent);
                Alert.alert('Event updated', `Event updated successfully!`);
            } else {
                const newEvent = {
                    userId: user.uid,
                    title: formData.title,
                    start: {
                        dateTime: formData.startDateTime,
                    },
                    end: {
                        dateTime: formData.endDateTime,
                    },
                };

                await addEvent(newEvent);
                Alert.alert('Event added', `Event added successfully!`);
            }
            setIsModalVisible(false);
        } catch (error) {
            Alert.alert('Error', `Failed to ${currentEvent ? 'update' : 'add'} event. Please try again.`);
        } finally {
            setLoadingForm(false);
        }
    };

    const renderEventCards = () => {
        return filteredEvents.map(event => {
            return (
                <EventItem
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                />
            );
        });
    };

    return (
        <View style={styles.container}>
            <Calendar
                displayLoadingIndicator={loadingCalendar}
                onDayPress={handleDayPress}
                markedDates={{...markedDates, ...selectedCalendarDates}}
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

const checkTime = (startDate: Date, endDate: Date): boolean => {
    return isSameDay(startDate, endDate);
}

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
    },

});

export default DashboardScreen;
