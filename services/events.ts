import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, QuerySnapshot, DocumentData } from 'firebase/firestore';
import firebaseService from "../firebaseConfig";

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
}

export async function addEvent(event: Omit<Event, 'id'>) {
    return  addDoc(eventsRef, event);
}

export async function updateEvent(event: Event) {
    const eventDoc = doc(firebaseDb, 'events', event.id);
    await updateDoc(eventDoc, event);
}

export async function deleteEvent(event: Event) {
    const eventDoc = doc(firebaseDb, 'events', event.id);
    await deleteDoc(eventDoc);
}

import { Timestamp } from 'firebase/firestore';

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

