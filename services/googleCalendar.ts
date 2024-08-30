import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { doc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import firebaseService from "../firebaseConfig";
import { Event as FirestoreEvent } from './events';

const firebaseDb = firebaseService.getDB();
const eventsCollection = collection(firebaseDb, 'events');

interface GoogleCalendarEvent {
    id: string;
    summary: string;
    start: { dateTime: string };
    end: { dateTime: string };
}

export async function syncGoogleCalendar(userId: string) {
    try {
        const userDoc = await getDoc(doc(firebaseDb, 'users', userId));
        const userData = userDoc.data();
        if (!userData) {
            console.log('No access token found. Please sign in with Google first.');
            return;
        }

        await GoogleSignin.signInSilently();
        const { accessToken } = await GoogleSignin.getTokens();

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&singleEvents=true&orderBy=startTime&timeMin=${new Date('2024-08-01T00:00:00Z').toISOString()}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const googleEvents = (data.items || []).filter((event: any) =>
            event.start?.dateTime && event.end?.dateTime && event.summary
        ) as GoogleCalendarEvent[];

        const firestoreEventsQuery = query(
            eventsCollection,
            where('userId', '==', userId),
            where('isGoogleCalendarEvent', '==', true)
        );
        const firestoreEventsSnapshot = await getDocs(firestoreEventsQuery);
        const firestoreEvents = firestoreEventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreEvent));

        const batch = writeBatch(firebaseDb);

        const googleEventIds = new Set<string>();
        for (const googleEvent of googleEvents) {
            googleEventIds.add(googleEvent.id);
            const existingEvent = firestoreEvents.find(e => e.googleCalendarEventId === googleEvent.id);

            if (existingEvent) {
                batch.update(doc(firebaseDb, 'events', existingEvent.id), {
                    title: googleEvent.summary,
                    start: { dateTime: new Date(googleEvent.start.dateTime) },
                    end: { dateTime: new Date(googleEvent.end.dateTime) },
                });
            } else {
                const newEventRef = doc(eventsCollection);
                batch.set(newEventRef, {
                    title: googleEvent.summary,
                    start: { dateTime: new Date(googleEvent.start.dateTime) },
                    end: { dateTime: new Date(googleEvent.end.dateTime) },
                    userId: userId,
                    isGoogleCalendarEvent: true,
                    googleCalendarEventId: googleEvent.id,
                });
            }
        }

        for (const firestoreEvent of firestoreEvents) {
            if (!googleEventIds.has(<string>firestoreEvent?.googleCalendarEventId)) {
                batch.delete(doc(firebaseDb, 'events', firestoreEvent.id));
            }
        }

        await batch.commit();
        console.log('Google Calendar sync completed successfully');
    } catch (error) {
        console.error('Error syncing Google Calendar:', error);
    }
}


async function getGoogleAccessToken(): Promise<string> {
    await GoogleSignin.signInSilently();
    const { accessToken } = await GoogleSignin.getTokens();
    return accessToken;
}

export async function addGoogleCalendarEvent(event: Omit<FirestoreEvent, 'id'>) {
    const accessToken = await getGoogleAccessToken();
    const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                summary: event.title,
                start: {
                    dateTime: event.start.dateTime.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: event.end.dateTime.toISOString(),
                    timeZone: 'UTC',
                },
            }),
        }
    );



    const data = await response.json();
    return data.id;
}

export async function updateGoogleCalendarEvent(event: FirestoreEvent): Promise<Response> {
    if (!event.googleCalendarEventId) {
        throw new Error('No Google Calendar event ID provided');
    }

    const accessToken = await getGoogleAccessToken();
    return  await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.googleCalendarEventId}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                summary: event.title,
                start: {
                    dateTime: event.start.dateTime.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: event.end.dateTime.toISOString(),
                    timeZone: 'UTC',
                },
            }),
        }
    );
}

export async function deleteGoogleCalendarEvent(googleCalendarEventId: string): Promise<Response> {
    const accessToken = await getGoogleAccessToken();
    return await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleCalendarEventId}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
}