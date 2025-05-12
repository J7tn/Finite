import React, { useState, useEffect } from 'react';
import { CountdownState } from '../types/countdown';

interface LifeCountdownProps {
    onDelete: () => void;
}

export const LifeCountdown: React.FC<LifeCountdownProps> = ({ onDelete }) => {
    const [countdownState, setCountdownState] = useState<CountdownState>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        progress: 0
    });
    const [motto, setMotto] = useState("Make every second count");
    const [birthDate, setBirthDate] = useState<Date>(new Date(1990, 0, 1));
    const [expectedLifespan] = useState(73.5); // Global average life expectancy

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
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Life Countdown</h3>
                <button
                    onClick={onDelete}
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

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${countdownState.progress * 100}%` }}
                ></div>
            </div>

            <div className="text-center mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-lg italic text-gray-600">"{motto}"</p>
            </div>
        </div>
    );
}; 