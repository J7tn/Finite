import React, { useState, useEffect } from 'react';
import { CreateCountdownForm } from '../components/CreateCountdownForm';
import { CountdownTimer } from '../components/CountdownTimer';
import { LifeCountdown } from '../components/LifeCountdown';
import { CountdownService } from '../services/countdownService';
import { CountdownEvent } from '../types/countdown';

export const CountdownPage: React.FC = () => {
    const [events, setEvents] = useState<CountdownEvent[]>([]);
    const [birthDate, setBirthDate] = useState<Date>(new Date(1990, 0, 1));
    const [motto, setMotto] = useState("Make every second count");

    const loadEvents = () => {
        setEvents(CountdownService.getInstance().getEvents());
    };

    const handleDeleteEvent = (id: string) => {
        CountdownService.getInstance().deleteEvent(id);
        loadEvents();
    };

    useEffect(() => {
        loadEvents();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Countdown Timers</h1>
                
                {/* Life Countdown Section */}
                <div className="mb-8">
                    <LifeCountdown
                        birthDate={birthDate}
                        motto={motto}
                        onDelete={() => {}} // Life countdown cannot be deleted
                    />
                </div>

                {/* Create New Countdown Form */}
                <CreateCountdownForm onEventCreated={loadEvents} />

                {/* Custom Countdowns */}
                <div className="space-y-6">
                    {events.length === 0 ? (
                        <p className="text-center text-muted-foreground">No countdown events yet. Create one above!</p>
                    ) : (
                        events.map((event) => (
                            <CountdownTimer
                                key={event.id}
                                event={event}
                                onDelete={() => handleDeleteEvent(event.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}; 