import React, { useState, useEffect } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Moon, Plus, ChevronDown, ChevronUp, Settings, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/components/EventForm';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import ExpandableBlock from '@/components/ExpandableBlock';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from '@/services/notificationService';

interface Event {
  id: string;
  name: string;
  date: Date;
  motto: string;
  notificationFrequency: string;
  type: string;
  lifeExpectancy?: number;
}

const getLocalStorageItem = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setLocalStorageItem = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing ${key} to localStorage:`, error);
  }
};

interface HomeProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  countdownVolume: number;
  setCountdownVolume: (volume: number) => void;
}

const Home: React.FC<HomeProps> = ({ isMuted, setIsMuted, volume, setVolume, countdownVolume, setCountdownVolume }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState<Date>(() => {
    const savedDate = getLocalStorageItem('birthDate', null);
    const date = savedDate ? new Date(savedDate) : new Date(1990, 0, 1);
    return date instanceof Date && !isNaN(date.getTime()) ? date : new Date(1990, 0, 1);
  });
  const [motto, setMotto] = useState<string>(() => {
    return getLocalStorageItem('motto', 'Make every second count');
  });
  const [notificationFrequency, setNotificationFrequency] = useState<string>(() => {
    return getLocalStorageItem('lifeNotificationFrequency', 'monthly');
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return getLocalStorageItem('darkMode', false);
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState<Event[]>(() => {
    const rawEvents = getLocalStorageItem('events', []);
    return rawEvents.map((event: any) => ({
      ...event,
      date: event.date ? new Date(event.date) : new Date(),
    }));
  });
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['life']));
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditingLife, setIsEditingLife] = useState(false);
  const [tempBirthDate, setTempBirthDate] = useState<Date>(birthDate);
  const [tempMotto, setTempMotto] = useState<string>(motto);
  const [tempNotificationFrequency, setTempNotificationFrequency] = useState<string>(notificationFrequency);

  useEffect(() => {
    if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
      setLocalStorageItem('birthDate', birthDate.toISOString());
    }
    setLocalStorageItem('motto', motto);
    setLocalStorageItem('lifeNotificationFrequency', notificationFrequency);
    
    // Start reminders with current settings when they change
    const reminderSettings = {
      frequency: notificationFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
      message: motto,
      enabled: true
    };
    
    // Start the reminder system
    notificationService.startReminders(reminderSettings, birthDate, 80);
  }, [birthDate, motto, notificationFrequency]);

  useEffect(() => {
    setLocalStorageItem('events', events);
  }, [events]);

  // Open life countdown edit dialog if flagged by onboarding
  useEffect(() => {
    if (localStorage.getItem('showLifeCountdownEdit') === 'true') {
      setIsEditingLife(true);
      localStorage.removeItem('showLifeCountdownEdit');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setLocalStorageItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleAddEvent = (eventData: {
    name: string;
    date: Date;
    motto: string;
    notificationFrequency: string;
    type: string;
    lifeExpectancy?: number;
  }) => {
    const newEvent: Event = {
      id: uuidv4(),
      name: eventData.name,
      date: eventData.date,
      motto: eventData.motto,
      notificationFrequency: eventData.notificationFrequency,
      type: eventData.type,
      lifeExpectancy: eventData.lifeExpectancy,
    };
    setEvents([...events, newEvent]);
    setShowEventForm(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
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

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const generateDayOptions = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleDateChange = (type: 'year' | 'month' | 'day', value: number) => {
    const newDate = new Date(tempBirthDate);
    if (type === 'year') {
      newDate.setFullYear(value);
    } else if (type === 'month') {
      newDate.setMonth(value - 1);
    } else if (type === 'day') {
      newDate.setDate(value);
    }
    setTempBirthDate(newDate);
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-end gap-2 pt-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4px)' }}>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            <Moon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Unmute ambience' : 'Mute ambience'}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Life Progress Block */}
        <ExpandableBlock
          eventName={t('events.lifeCountdown')}
          motto={motto}
          targetDate={birthDate}
          eventType="lifeCountdown"
          lifeExpectancy={80}
          isExpanded={expandedBlocks.has('life')}
          onExpand={() => toggleBlock('life')}
          onEdit={() => {
            setTempBirthDate(birthDate);
            setTempMotto(motto);
            setTempNotificationFrequency(notificationFrequency);
            setIsEditingLife(true);
          }}
          isMuted={isMuted}
          countdownVolume={countdownVolume}
        />

        {/* Custom Event Blocks */}
        {events.map((event) => (
          <ExpandableBlock
            key={event.id}
            eventName={event.name}
            motto={event.motto}
            targetDate={event.date}
            eventType={event.type}
            lifeExpectancy={event.lifeExpectancy}
            isExpanded={expandedBlocks.has(event.id)}
            onExpand={() => toggleBlock(event.id)}
            onEdit={() => setEditingEvent(event)}
            onDelete={() => handleDeleteEvent(event.id)}
            isMuted={isMuted}
            eventId={event.id}
            countdownVolume={countdownVolume}
          />
        ))}

        {/* Add New Event Button */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setShowEventForm(true)}
        >
          <Plus className="h-5 w-5" />
          {t('events.addNew')}
        </Button>

        {/* Life Countdown Edit Dialog */}
        <Dialog open={isEditingLife} onOpenChange={setIsEditingLife}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('lifeCountdown.edit')}</h2>
              <div className="space-y-2">
                <Label>{t('lifeCountdown.birthDate')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={tempBirthDate.getFullYear().toString()}
                    onValueChange={(value) => handleDateChange('year', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.year')} />
                    </SelectTrigger>
                    <SelectContent>
                      {generateYearOptions().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={(tempBirthDate.getMonth() + 1).toString()}
                    onValueChange={(value) => handleDateChange('month', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.month')} />
                    </SelectTrigger>
                    <SelectContent>
                      {generateMonthOptions().map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={tempBirthDate.getDate().toString()}
                    onValueChange={(value) => handleDateChange('day', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.day')} />
                    </SelectTrigger>
                    <SelectContent>
                      {generateDayOptions(
                        tempBirthDate.getFullYear(),
                        tempBirthDate.getMonth() + 1
                      ).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motto">{t('lifeCountdown.motto')}</Label>
                <Input
                  id="motto"
                  value={tempMotto}
                  onChange={(e) => setTempMotto(e.target.value)}
                  placeholder={t('lifeCountdown.motto')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('lifeCountdown.reminderFrequency')}</Label>
                <Select
                  value={tempNotificationFrequency}
                  onValueChange={setTempNotificationFrequency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('lifeCountdown.reminderFrequency')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('lifeCountdown.frequencies.daily')}</SelectItem>
                    <SelectItem value="monthly">{t('lifeCountdown.frequencies.monthly')}</SelectItem>
                    <SelectItem value="yearly">{t('lifeCountdown.frequencies.yearly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingLife(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    setBirthDate(tempBirthDate);
                    setMotto(tempMotto);
                    setNotificationFrequency(tempNotificationFrequency);
                    
                    // Start reminders based on the selected frequency
                    const reminderSettings = {
                      frequency: tempNotificationFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
                      message: tempMotto,
                      enabled: true
                    };
                    
                    // Start the reminder system
                    notificationService.startReminders(reminderSettings, tempBirthDate, 80);
                    
                    setIsEditingLife(false);
                  }}
                >
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Form Dialog */}
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogContent hideClose={true} className="max-h-[90vh] overflow-y-auto">
            <EventForm
              onSubmit={handleAddEvent}
              onCancel={() => setShowEventForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEvent?.type === 'lifeCountdown' 
                  ? t('events.editLifeCountdown')
                  : t('events.editEvent')}
              </DialogTitle>
            </DialogHeader>
            {editingEvent?.type === 'lifeCountdown' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('events.name')}</Label>
                  <Input
                    id="name"
                    value={editingEvent.name || ''}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t('events.birthDate')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={editingEvent?.date ? editingEvent.date.getFullYear().toString() : new Date().getFullYear().toString()}
                      onValueChange={(value) => {
                        if (editingEvent) {
                          const newDate = new Date(editingEvent.date);
                          newDate.setFullYear(parseInt(value));
                          setEditingEvent({ ...editingEvent, date: newDate });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.year')} />
                      </SelectTrigger>
                      <SelectContent>
                        {generateYearOptions().map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={editingEvent?.date ? (editingEvent.date.getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()}
                      onValueChange={(value) => {
                        if (editingEvent) {
                          const newDate = new Date(editingEvent.date);
                          newDate.setMonth(parseInt(value) - 1);
                          setEditingEvent({ ...editingEvent, date: newDate });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.month')} />
                      </SelectTrigger>
                      <SelectContent>
                        {generateMonthOptions().map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={editingEvent?.date ? editingEvent.date.getDate().toString() : new Date().getDate().toString()}
                      onValueChange={(value) => {
                        if (editingEvent) {
                          const newDate = new Date(editingEvent.date);
                          newDate.setDate(parseInt(value));
                          setEditingEvent({ ...editingEvent, date: newDate });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.day')} />
                      </SelectTrigger>
                      <SelectContent>
                        {generateDayOptions(
                          editingEvent?.date ? editingEvent.date.getFullYear() : new Date().getFullYear(),
                          editingEvent?.date ? editingEvent.date.getMonth() + 1 : new Date().getMonth() + 1
                        ).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeExpectancy">{t('events.lifeExpectancy')}</Label>
                  <Input
                    id="lifeExpectancy"
                    type="number"
                    min="1"
                    max="150"
                    value={editingEvent.lifeExpectancy || 80}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({
                          ...editingEvent,
                          lifeExpectancy: parseInt(e.target.value) || 80
                        });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motto">{t('events.motto')}</Label>
                  <Input
                    id="motto"
                    value={editingEvent.motto || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, motto: e.target.value });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('lifeCountdown.reminderFrequency')}</Label>
                  <Select
                    value={editingEvent.notificationFrequency || 'monthly'}
                    onValueChange={(value) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, notificationFrequency: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('lifeCountdown.reminderFrequency')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('lifeCountdown.frequencies.daily')}</SelectItem>
                      <SelectItem value="monthly">{t('lifeCountdown.frequencies.monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('lifeCountdown.frequencies.yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingEvent(null)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingEvent) {
                        const updatedEvents = events.map(event =>
                          event.id === editingEvent.id ? editingEvent : event
                        );
                        setEvents(updatedEvents);
                        localStorage.setItem('events', JSON.stringify(updatedEvents));
                        
                        // Start reminders for custom life countdown events
                        if (editingEvent.type === 'lifeCountdown') {
                          const reminderSettings = {
                            frequency: editingEvent.notificationFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
                            message: editingEvent.motto,
                            enabled: true
                          };
                          
                          // Start the reminder system for this custom event
                          notificationService.startReminders(reminderSettings, editingEvent.date, editingEvent.lifeExpectancy || 80);
                        }
                        
                        setEditingEvent(null);
                      }
                    }}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            ) : (
              <EventForm
                initialData={editingEvent}
                onSubmit={(data) => {
                  if (editingEvent) {
                    const updatedEvents = events.map(event =>
                      event.id === editingEvent.id ? { ...event, ...data } : event
                    );
                    setEvents(updatedEvents);
                    localStorage.setItem('events', JSON.stringify(updatedEvents));
                    setEditingEvent(null);
                  }
                }}
                onCancel={() => setEditingEvent(null)}
                onDelete={() => {
                  if (editingEvent) {
                    const updatedEvents = events.filter(event => event.id !== editingEvent.id);
                    setEvents(updatedEvents);
                    localStorage.setItem('events', JSON.stringify(updatedEvents));
                    setEditingEvent(null);
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Home; 