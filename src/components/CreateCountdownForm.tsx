import React, { useState } from 'react';
import { CountdownService } from '../services/countdownService';

interface CreateCountdownFormProps {
    onEventCreated: () => void;
}

export const CreateCountdownForm: React.FC<CreateCountdownFormProps> = ({ onEventCreated }) => {
    const [eventName, setEventName] = useState('');
    const [targetDate, setTargetDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!eventName || !targetDate) {
            alert('Please fill in all fields');
            return;
        }

        const date = new Date(targetDate);
        if (date <= new Date()) {
            alert('Please select a future date');
            return;
        }

        CountdownService.getInstance().createEvent(eventName, date);
        setEventName('');
        setTargetDate('');
        onEventCreated();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Countdown</h2>
            
            <div className="mb-4">
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name
                </label>
                <input
                    type="text"
                    id="eventName"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Summer Vacation"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date
                </label>
                <input
                    type="datetime-local"
                    id="targetDate"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Create Countdown
            </button>
        </form>
    );
}; 