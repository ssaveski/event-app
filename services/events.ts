import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, QuerySnapshot, DocumentData } from 'firebase/firestore';
import firebaseService from "../firebaseConfig";
import { Timestamp } from 'firebase/firestore';
import { addGoogleCalendarEvent, deleteGoogleCalendarEvent, updateGoogleCalendarEvent } from "./googleCalendar";

const firebaseDb = firebaseService.getDB();
const eventsRef = collection(firebaseDb, 'events');

export interface Event {
    id: string;
    title: string;
    start: {
        dateTime: Date;
    };
    end: {
        dateTime: Date;
    };
    userId: string;
    isGoogleCalendarEvent?: boolean;
    googleCalendarEventId?: string;
}

async function handleGoogleCalendarEvent(event: Event | Omit<Event, 'id'>, operation: 'add' | 'update' | 'delete', isSyncedGoogle) {
    if (!isSyncedGoogle) return;

    switch (operation) {
        case 'add':
            if (event.isGoogleCalendarEvent) {
                event.googleCalendarEventId = await addGoogleCalendarEvent(event);
            }
            break;
        case 'update':
            if (event.googleCalendarEventId) {
                await updateGoogleCalendarEvent(event as Event);
            }
            break;
        case 'delete':
            if (event.googleCalendarEventId) {
                await deleteGoogleCalendarEvent(event.googleCalendarEventId);
            }
            break;
        default:
            break;
    }
}

export async function addEvent(event: Omit<Event, 'id'>, isSyncedGoogle: boolean) {
    let googleCalendarEventId = null;
    if (isSyncedGoogle) {
       googleCalendarEventId = await handleGoogleCalendarEvent(event, 'add', isSyncedGoogle);
    }
    return addDoc(eventsRef, {...event, googleCalendarEventId});
}

export async function updateEvent(event: Event, isSyncedGoogle: boolean) {
    await handleGoogleCalendarEvent(event, 'update', isSyncedGoogle);
    const eventDoc = doc(firebaseDb, 'events', event.id);
    await updateDoc(eventDoc, event);
}

export async function deleteEvent(event: Event, isSyncedGoogle: boolean) {
    await handleGoogleCalendarEvent(event, 'delete', isSyncedGoogle);
    const eventDoc = doc(firebaseDb, 'events', event.id);
    await deleteDoc(eventDoc);
}

export function subscribeToEvents(userId: string, callback: (events: Event[]) => void) {
    const q = query(eventsRef, where("userId", "==", userId));
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
        const events = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                start: {
                    dateTime: (data.start.dateTime as Timestamp).toDate()
                },
                end: {
                    dateTime: (data.end.dateTime as Timestamp).toDate()
                }
            } as Event;
        });
        callback(events);
    }, (error) => {
        return error;
    });
}
