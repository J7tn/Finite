import React, { useState } from 'react';
import { CountdownService } from '../services/countdownService';

interface CreateCountdownFormProps {
    onEventCreated: () => void;
}

export const CreateCountdownForm: React.FC<CreateCountdownFormProps> = ({ onEventCreated }) => {
    const [eventName, setEventName] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [motto, setMotto] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!eventName || !targetDate) {
            alert('Please fill in all required fields');
            return;
        }

        const targetDateObj = new Date(targetDate);
        if (targetDateObj <= new Date()) {
            alert('Please select a future date');
            return;
        }

        CountdownService.getInstance().createEvent(eventName, targetDateObj, motto, description);
        setEventName('');
        setTargetDate('');
        setMotto('');
        setDescription('');
        onEventCreated();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-background border border-border rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Countdown</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="eventName" className="block text-sm font-medium mb-1">
                        Event Name *
                    </label>
                    <input
                        type="text"
                        id="eventName"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="targetDate" className="block text-sm font-medium mb-1">
                        Target Date *
                    </label>
                    <input
                        type="datetime-local"
                        id="targetDate"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="motto" className="block text-sm font-medium mb-1">
                        Motto
                    </label>
                    <input
                        type="text"
                        id="motto"
                        value={motto}
                        onChange={(e) => setMotto(e.target.value)}
                        placeholder="Make every moment count"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description for your countdown"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        rows={3}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
                >
                    Create Countdown
                </button>
            </div>
        </form>
    );
}; 