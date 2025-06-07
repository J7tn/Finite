import React, { useState, useEffect } from 'react';
import { LifeProgressBar } from '@/components/LifeProgressBar';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Moon, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EventForm from '@/components/EventForm';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['life']));

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

  const toggleBlock = (id: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set<string>();
      if (prev.has(id)) {
        return newSet;
      }
      newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            <Moon className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Life Progress Block */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Life Progress</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleBlock('life')}
                aria-label={expandedBlocks.has('life') ? "Collapse" : "Expand"}
              >
                {expandedBlocks.has('life') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </Button>
            </div>

            <AnimatePresence>
              {expandedBlocks.has('life') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setShowEventForm(true)}
        >
          <Plus className="h-5 w-5" />
          Add New Event
        </Button>

        {/* Scrollable events list */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {events.map(event => (
            <Card key={event.id} className="bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{event.name}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBlock(event.id)}
                    aria-label={expandedBlocks.has(event.id) ? "Collapse" : "Expand"}
                  >
                    {expandedBlocks.has(event.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Button>
                </div>

                <AnimatePresence>
                  {expandedBlocks.has(event.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2">
                        <CountdownTimer
                          birthDate={undefined}
                          motto={event.motto}
                          targetDate={new Date(event.date)}
                          startDate={new Date(event.createdAt)}
                          progressLabel={event.name}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
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