import React, { useEffect, useState } from 'react';
import { CountdownEvent, CountdownState } from '../types/countdown';
import { CountdownService } from '../services/countdownService';

interface CountdownTimerProps {
    event: CountdownEvent;
    onDelete: (id: string) => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ event, onDelete }) => {
    const [countdownState, setCountdownState] = useState<CountdownState>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        progress: 0
    });

    useEffect(() => {
        const updateCountdown = () => {
            const state = CountdownService.getInstance().calculateCountdownState(event);
            setCountdownState(state);
        };

        // Update immediately
        updateCountdown();

        // Update every second
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [event]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{event.name}</h3>
                <button
                    onClick={() => onDelete(event.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    Delete
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{countdownState.days}</div>
                    <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{countdownState.hours}</div>
                    <div className="text-sm text-gray-600">Hours</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{countdownState.minutes}</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{countdownState.seconds}</div>
                    <div className="text-sm text-gray-600">Seconds</div>
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${countdownState.progress * 100}%` }}
                ></div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
                Target Date: {event.targetDate.toLocaleDateString()}
            </div>
        </div>
    );
};
