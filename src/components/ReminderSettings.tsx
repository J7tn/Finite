import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReminderSettingsProps {
  birthDate: Date;
  expectedLifespan: number;
  onSaveReminder: (settings: ReminderSettings) => void;
}

export interface ReminderSettings {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  message: string;
  enabled: boolean;
}

export function ReminderSettings({ birthDate, expectedLifespan, onSaveReminder }: ReminderSettingsProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [message, setMessage] = useState('');
  const [enabled, setEnabled] = useState(false);

  const handleSave = () => {
    onSaveReminder({
      frequency,
      message,
      enabled
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Reminder Settings</h3>
      
      <div className="space-y-2">
        <Label htmlFor="frequency">Reminder Frequency</Label>
        <Select
          value={frequency}
          onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFrequency(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Personal Message</Label>
        <Input
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your reminder message..."
          className="w-full"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="enableReminders"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="enableReminders">Enable Reminders</Label>
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Reminder Settings
      </Button>
    </div>
  );
} 