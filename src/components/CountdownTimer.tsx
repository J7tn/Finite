import React, { useState, useEffect } from 'react';
import { CountdownEvent, CountdownState } from '../types/countdown';
import { CountdownService } from '../services/countdownService';

interface CountdownTimerProps {
    event: CountdownEvent;
    onDelete: () => void;
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
        const calculateTimeRemaining = () => {
            const now = new Date();
            const targetDate = new Date(event.targetDate);
            const timeRemaining = targetDate.getTime() - now.getTime();

            if (timeRemaining <= 0) {
                setCountdownState({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    progress: 1
                });
                return;
            }

            const totalDuration = targetDate.getTime() - new Date(event.createdAt).getTime();
            const progress = 1 - (timeRemaining / totalDuration);

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            setCountdownState({
                days,
                hours,
                minutes,
                seconds,
                progress
            });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [event]);

    return (
        <div className="bg-background border border-border rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{event.name}</h3>
                <button
                    onClick={onDelete}
                    className="text-foreground hover:text-muted-foreground"
                >
                    Delete
                </button>
            </div>

            <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold">{Math.floor(countdownState.days / 365)}</div>
                    <div className="text-sm text-muted-foreground">Years</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold">{Math.floor((countdownState.days % 365) / 30)}</div>
                    <div className="text-sm text-muted-foreground">Months</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold">{countdownState.days % 30}</div>
                    <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold">{countdownState.hours}</div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold">{countdownState.minutes}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold">{countdownState.seconds}</div>
                    <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{(countdownState.progress * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${countdownState.progress * 100}%` }}
                    ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                    {event.description || `Time remaining until ${new Date(event.targetDate).toLocaleDateString()}`}
                </p>
            </div>

            <div className="text-center mt-4 p-4 bg-muted/50 rounded-md">
                <p className="text-lg italic text-muted-foreground">"{event.motto || 'Make every moment count'}"</p>
            </div>
        </div>
    );
};
