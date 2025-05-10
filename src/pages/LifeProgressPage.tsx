import React, { useState, useEffect } from 'react';
import { LifeProgressBar } from '@/components/LifeProgressBar';
import { ReminderSettings, type ReminderSettings as ReminderSettingsType } from '@/components/ReminderSettings';
import { notificationService } from '@/services/notificationService';
import { calculateRemainingTime, formatRemainingTime } from '@/utils/timeCalculations';

export function LifeProgressPage() {
  const [birthDate, setBirthDate] = useState<Date>(new Date('1990-01-01'));
  const [expectedLifespan, setExpectedLifespan] = useState(80);
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    const updateRemainingTime = () => {
      const time = calculateRemainingTime(birthDate, expectedLifespan);
      setRemainingTime(formatRemainingTime(time));
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [birthDate, expectedLifespan]);

  const handleSaveReminder = (settings: ReminderSettingsType) => {
    notificationService.startReminders(settings, birthDate, expectedLifespan);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Life Progress Tracker</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Birth Date
          </label>
          <input
            type="date"
            value={birthDate.toISOString().split('T')[0]}
            onChange={(e) => setBirthDate(new Date(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Expected Lifespan (years)
          </label>
          <input
            type="number"
            value={expectedLifespan}
            onChange={(e) => setExpectedLifespan(Number(e.target.value))}
            min="1"
            max="120"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="p-6 bg-card rounded-lg shadow-sm">
          <LifeProgressBar
            birthDate={birthDate}
            expectedLifespan={expectedLifespan}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Time Remaining</h3>
          <p className="text-2xl font-bold">{remainingTime}</p>
        </div>

        <ReminderSettings
          birthDate={birthDate}
          expectedLifespan={expectedLifespan}
          onSaveReminder={handleSaveReminder}
        />
      </div>
    </div>
  );
} 