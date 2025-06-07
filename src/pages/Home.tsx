import React, { useState, useEffect } from 'react';
import { LifeProgressBar } from '@/components/LifeProgressBar';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Moon, Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EventForm from '@/components/EventForm';

interface Event {
  id: string;
  name: string;
  date: Date;
  motto: string;
  createdAt: number;
  notificationFrequency: string;
}

const Home: React.FC = () => {
  const [birthDate, setBirthDate] = useState<Date>(() => {
    const savedDate = localStorage.getItem('birthDate');
    return savedDate ? new Date(savedDate) : new Date(1990, 0, 1);
  });
  const [motto, setMotto] = useState<string>(() => {
    return localStorage.getItem('motto') || 'Make every second count';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? stored === 'true' : false;
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('events');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  useEffect(() => {
    localStorage.setItem('birthDate', birthDate.toISOString());
    localStorage.setItem('motto', motto);
  }, [birthDate, motto]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleAddEvent = (eventData: { name: string; date: Date; motto: string; notificationFrequency: string }) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setEvents(prev => [...prev, newEvent]);
    setShowEventForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Life Progress</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              <Moon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowEventForm(true)}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 bg-card rounded-lg shadow-sm">
          <LifeProgressBar
            birthDate={birthDate}
            expectedLifespan={80}
            progressLabel="Life Progress"
          />
        </div>

        <CountdownTimer
          birthDate={birthDate}
          motto={motto}
        />

        {/* Scrollable events list */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {events.map(event => (
            <CountdownTimer
              key={event.id}
              birthDate={undefined}
              motto={event.motto}
              targetDate={new Date(event.date)}
              startDate={new Date(event.createdAt)}
              progressLabel={event.name}
            />
          ))}
        </div>

        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogContent>
            <EventForm
              onSubmit={handleAddEvent}
              onCancel={() => setShowEventForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Home; 