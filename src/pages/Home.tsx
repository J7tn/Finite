import React, { useState, useEffect } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Moon, Plus, Settings, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import EventForm from '@/components/EventForm';
import { motion } from 'framer-motion';
import ExpandableBlock from '@/components/ExpandableBlock';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAudio } from '@/contexts/AudioContext';
import { notificationService } from '@/services/notificationService';
import { Event, DEFAULT_LIFE_EXPECTANCY } from '@/types';

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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMuted, setIsMuted } = useAudio();

  const [birthDate, setBirthDate] = useState<Date>(() => {
    const savedDate = getLocalStorageItem('birthDate', null);
    const date = savedDate ? new Date(savedDate) : new Date(1990, 0, 1);
    return date instanceof Date && !isNaN(date.getTime()) ? date : new Date(1990, 0, 1);
  });
  const [motto, setMotto] = useState<string>(() => {
    return getLocalStorageItem('motto', t('common.defaultMotto'));
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

    if (!import.meta.env.DEV) {
      const hasCompletedOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
      if (!hasCompletedOnboarding) {
        localStorage.removeItem('events');
        return [];
      }
    }

    return rawEvents.map((event: any) => ({
      ...event,
      date: event.date ? new Date(event.date) : new Date(),
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
    }));
  });
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['life']));
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditingLife, setIsEditingLife] = useState(false);
  const [tempBirthDate, setTempBirthDate] = useState<Date>(birthDate);
  const [tempMotto, setTempMotto] = useState<string>(motto);
  const [tempNotificationFrequency, setTempNotificationFrequency] = useState<string>(notificationFrequency);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const getNotificationStrings = () => ({
    title: t('notifications.lifeProgressReminder'),
    bodyPrefix: t('notifications.timeRemaining'),
    personalMessageLabel: t('notifications.personalMessage'),
  });

  useEffect(() => {
    if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
      setLocalStorageItem('birthDate', birthDate.toISOString());
    }
    setLocalStorageItem('motto', motto);
    setLocalStorageItem('lifeNotificationFrequency', notificationFrequency);

    notificationService.startReminders(
      { frequency: notificationFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly', message: motto, enabled: true },
      birthDate,
      DEFAULT_LIFE_EXPECTANCY,
      getNotificationStrings()
    );
  }, [birthDate, motto, notificationFrequency]);

  useEffect(() => {
    setLocalStorageItem('events', events);
  }, [events]);

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

  const handleAddEvent = (eventData: {
    name: string;
    date: Date;
    motto: string;
    notificationFrequency: string;
    type: string;
    lifeExpectancy?: number;
  }) => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      name: eventData.name,
      date: eventData.date,
      motto: eventData.motto,
      notificationFrequency: eventData.notificationFrequency,
      type: eventData.type,
      lifeExpectancy: eventData.lifeExpectancy,
      createdAt: new Date(),
    };
    setEvents([...events, newEvent]);
    setShowEventForm(false);
  };

  const confirmDeleteEvent = () => {
    if (!deletingEventId) return;
    const updatedEvents = events.filter(event => event.id !== deletingEventId);
    setEvents(updatedEvents);
    setDeletingEventId(null);
  };

  const toggleBlock = (id: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set<string>();
      if (!prev.has(id)) newSet.add(id);
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

  const generateMonthOptions = () => Array.from({ length: 12 }, (_, i) => i + 1);

  const generateDayOptions = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleDateChange = (type: 'year' | 'month' | 'day', value: number) => {
    const newDate = new Date(tempBirthDate);
    if (type === 'year') newDate.setFullYear(value);
    else if (type === 'month') newDate.setMonth(value - 1);
    else if (type === 'day') newDate.setDate(value);
    setTempBirthDate(newDate);
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-end gap-2 pt-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4px)' }}>
          <Button variant="ghost" size="icon" onClick={() => setIsDarkMode((prev: boolean) => !prev)}>
            <Moon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Unmute ambience' : 'Mute ambience'}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <ExpandableBlock
          eventName={t('events.lifeCountdown')}
          motto={motto}
          targetDate={birthDate}
          eventType="lifeCountdown"
          lifeExpectancy={DEFAULT_LIFE_EXPECTANCY}
          isExpanded={expandedBlocks.has('life')}
          onExpand={() => toggleBlock('life')}
          onEdit={() => {
            setTempBirthDate(birthDate);
            setTempMotto(motto);
            setTempNotificationFrequency(notificationFrequency);
            setIsEditingLife(true);
          }}
        />

        {events.map((event) => (
          <ExpandableBlock
            key={event.id}
            eventName={event.name}
            motto={event.motto}
            targetDate={event.date}
            eventType={event.type}
            lifeExpectancy={event.lifeExpectancy}
            createdAt={event.createdAt}
            isExpanded={expandedBlocks.has(event.id)}
            onExpand={() => toggleBlock(event.id)}
            onEdit={() => setEditingEvent(event)}
            onDelete={() => setDeletingEventId(event.id)}
            eventId={event.id}
          />
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-1">{t('events.noEvents')}</p>
            <p className="text-sm">{t('events.noEventsDescription')}</p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setShowEventForm(true)}
        >
          <Plus className="h-5 w-5" />
          {t('events.addNew')}
        </Button>

        {/* Delete confirmation dialog */}
        <AlertDialog open={!!deletingEventId} onOpenChange={(open) => { if (!open) setDeletingEventId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
              <AlertDialogDescription>{t('common.confirmDeleteMessage')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteEvent}>{t('common.confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
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
                        <SelectItem key={month} value={month.toString()}>{MONTH_NAMES[month - 1]}</SelectItem>
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
                      {generateDayOptions(tempBirthDate.getFullYear(), tempBirthDate.getMonth() + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motto">{t('lifeCountdown.motto')}</Label>
                <Input id="motto" value={tempMotto} onChange={(e) => setTempMotto(e.target.value)} placeholder={t('lifeCountdown.motto')} />
              </div>
              <div className="space-y-2">
                <Label>{t('lifeCountdown.reminderFrequency')}</Label>
                <Select value={tempNotificationFrequency} onValueChange={setTempNotificationFrequency}>
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
                    notificationService.startReminders(
                      { frequency: tempNotificationFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly', message: tempMotto, enabled: true },
                      tempBirthDate,
                      DEFAULT_LIFE_EXPECTANCY,
                      getNotificationStrings()
                    );
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
            <EventForm onSubmit={handleAddEvent} onCancel={() => setShowEventForm(false)} />
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
                      <SelectTrigger><SelectValue placeholder={t('common.year')} /></SelectTrigger>
                      <SelectContent>
                        {generateYearOptions().map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
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
                      <SelectTrigger><SelectValue placeholder={t('common.month')} /></SelectTrigger>
                      <SelectContent>
                        {generateMonthOptions().map((month) => (
                          <SelectItem key={month} value={month.toString()}>{MONTH_NAMES[month - 1]}</SelectItem>
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
                      <SelectTrigger><SelectValue placeholder={t('common.day')} /></SelectTrigger>
                      <SelectContent>
                        {generateDayOptions(
                          editingEvent?.date ? editingEvent.date.getFullYear() : new Date().getFullYear(),
                          editingEvent?.date ? editingEvent.date.getMonth() + 1 : new Date().getMonth() + 1
                        ).map((day) => (
                          <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
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
                    value={editingEvent.lifeExpectancy || DEFAULT_LIFE_EXPECTANCY}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({
                          ...editingEvent,
                          lifeExpectancy: parseInt(e.target.value) || DEFAULT_LIFE_EXPECTANCY
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
                      if (editingEvent) setEditingEvent({ ...editingEvent, motto: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('lifeCountdown.reminderFrequency')}</Label>
                  <Select
                    value={editingEvent.notificationFrequency || 'monthly'}
                    onValueChange={(value) => {
                      if (editingEvent) setEditingEvent({ ...editingEvent, notificationFrequency: value });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder={t('lifeCountdown.reminderFrequency')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('lifeCountdown.frequencies.daily')}</SelectItem>
                      <SelectItem value="monthly">{t('lifeCountdown.frequencies.monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('lifeCountdown.frequencies.yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setEditingEvent(null)}>{t('common.cancel')}</Button>
                  <Button
                    onClick={() => {
                      if (editingEvent) {
                        const updatedEvents = events.map(event =>
                          event.id === editingEvent.id ? editingEvent : event
                        );
                        setEvents(updatedEvents);
                        if (editingEvent.type === 'lifeCountdown') {
                          notificationService.startReminders(
                            { frequency: editingEvent.notificationFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly', message: editingEvent.motto, enabled: true },
                            editingEvent.date,
                            editingEvent.lifeExpectancy || DEFAULT_LIFE_EXPECTANCY,
                            getNotificationStrings()
                          );
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
                initialData={editingEvent ? { ...editingEvent } : undefined}
                onSubmit={(data) => {
                  if (editingEvent) {
                    const updatedEvents = events.map(event =>
                      event.id === editingEvent.id ? { ...event, ...data } : event
                    );
                    setEvents(updatedEvents);
                    setEditingEvent(null);
                  }
                }}
                onCancel={() => setEditingEvent(null)}
                onDelete={() => {
                  if (editingEvent) {
                    setDeletingEventId(editingEvent.id);
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
