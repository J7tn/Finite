import React, { useState, useEffect } from 'react';
import { CountdownState } from '../types/countdown';

interface LifeCountdownProps {
    onDelete: () => void;
    birthDate: Date;
    motto: string;
    expectedLifespan?: number;
}

export const LifeCountdown: React.FC<LifeCountdownProps> = ({ 
    onDelete, 
    birthDate, 
    motto, 
    expectedLifespan = 73.5 
}) => {
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
            const ageInMilliseconds = now.getTime() - birthDate.getTime();
            const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
            const remainingYears = expectedLifespan - ageInYears;

            // Calculate percentage of life lived
            const progress = Math.min(Math.max(ageInYears / expectedLifespan, 0), 1);

            if (remainingYears <= 0) {
                setCountdownState({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    progress: 1
                });
                return;
            }

            const years = Math.floor(remainingYears);
            const monthsDecimal = (remainingYears - years) * 12;
            const months = Math.floor(monthsDecimal);
            const daysDecimal = (monthsDecimal - months) * 30.44;
            const days = Math.floor(daysDecimal);
            const hoursDecimal = (daysDecimal - days) * 24;
            const hours = Math.floor(hoursDecimal);
            const minutesDecimal = (hoursDecimal - hours) * 60;
            const minutes = Math.floor(minutesDecimal);
            const seconds = Math.floor((minutesDecimal - minutes) * 60);

            setCountdownState({
                days: days + (years * 365) + (months * 30),
                hours,
                minutes,
                seconds,
                progress
            });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [birthDate, expectedLifespan]);

    return (
        <div className="bg-background border border-border rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Life Countdown</h3>
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
                    <span className="text-sm font-medium">Life Progress</span>
                    <span className="text-sm font-medium">{(countdownState.progress * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${countdownState.progress * 100}%` }}
                    ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Based on an expected lifespan of {expectedLifespan} years
                </p>
            </div>

            <div className="text-center mt-4 p-4 bg-muted/50 rounded-md">
                <p className="text-lg italic text-muted-foreground">"{motto}"</p>
            </div>
        </div>
    );
}; 