import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { t } from "@/services/translation";
import { Label } from "@/components/ui/label";
import EventSuggestions from "./EventSuggestions";

interface EventFormProps {
  onSubmit: (data: {
    name: string;
    date: Date;
    motto: string;
    notificationFrequency: string;
    type: string;
    lifeExpectancy?: number;
  }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: {
    name: string;
    date: Date;
    motto: string;
    notificationFrequency: string;
    type?: string;
    lifeExpectancy?: number;
  };
}

const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  onCancel,
  onDelete,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [motto, setMotto] = useState(initialData?.motto || '');
  const [notificationFrequency, setNotificationFrequency] = useState(initialData?.notificationFrequency || 'monthly');
  const [type, setType] = useState(initialData?.type || 'custom');
  const [lifeExpectancy, setLifeExpectancy] = useState(initialData?.lifeExpectancy?.toString() || '80');
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [year, setYear] = useState(initialData?.date ? initialData.date.getFullYear() : new Date().getFullYear());
  const [month, setMonth] = useState(initialData?.date ? initialData.date.getMonth() + 1 : new Date().getMonth() + 1);
  const [day, setDay] = useState(initialData?.date ? initialData.date.getDate() : new Date().getDate());

  // Show suggestions when form opens for new events and name is empty
  useEffect(() => {
    if (!initialData && type === 'custom' && name.trim() === '') {
      // Delay showing suggestions to give user time to start typing
      const timer = setTimeout(() => {
        setShowSuggestions(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [initialData, type, name]);

  // Hide suggestions when user starts typing
  useEffect(() => {
    if (name.trim() !== '') {
      setShowSuggestions(false);
    }
  }, [name]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear + 100; year++) {
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

  const handleSuggestionClick = (suggestion: string) => {
    // Extract a meaningful name from the suggestion
    const suggestionMap: { [key: string]: string } = {
      [t('events.suggestions.spouseBirthday')]: "Spouse's Birthday",
      [t('events.suggestions.spouseAnniversary')]: "Wedding Anniversary",
      [t('events.suggestions.specialDay')]: "Special Day",
      [t('events.suggestions.vacation')]: "Next Vacation",
      [t('events.suggestions.retirement')]: "Retirement",
      [t('events.suggestions.graduation')]: "Graduation",
      [t('events.suggestions.milestone')]: "Milestone Birthday",
      [t('events.suggestions.holiday')]: "Favorite Holiday"
    };
    
    setName(suggestionMap[suggestion] || suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (type === 'custom' && date.getTime() === today.getTime()) {
      setError(t('events.errorSameDay'));
      return;
    }
    setError(null);
    onSubmit({
      name,
      date,
      motto,
      notificationFrequency,
      type,
      lifeExpectancy: type === 'lifeCountdown' ? parseInt(lifeExpectancy) : undefined
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full"
    >
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            
            <div className="space-y-2">
              <Label>{t('events.type')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('events.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t('events.types.custom')}</SelectItem>
                  <SelectItem value="lifeCountdown">{t('events.types.lifeCountdown')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('events.name')}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('events.name')}
                required
              />
            </div>

            {/* Show suggestions for custom events when name is empty */}
            {type === 'custom' && !initialData && (
              <EventSuggestions
                onSuggestionClick={handleSuggestionClick}
                onDismiss={() => setShowSuggestions(false)}
                isVisible={showSuggestions}
              />
            )}

            {type === 'lifeCountdown' && (
              <div className="space-y-2">
                <Label>{t('events.lifeExpectancy')}</Label>
                <Input
                  type="number"
                  value={lifeExpectancy}
                  onChange={(e) => setLifeExpectancy(e.target.value)}
                  placeholder={t('events.lifeExpectancy')}
                  min="1"
                  max="150"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date">
                {type === 'lifeCountdown' ? t('events.birthDate') : t('events.date')}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={year.toString()}
                  onValueChange={(value) => setYear(parseInt(value))}
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
                  value={month.toString()}
                  onValueChange={(value) => setMonth(parseInt(value))}
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
                  value={day.toString()}
                  onValueChange={(value) => setDay(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.day')} />
                  </SelectTrigger>
                  <SelectContent>
                    {generateDayOptions(year, month).map((d) => {
                      const isToday = (() => {
                        const today = new Date();
                        return (
                          type === 'custom' &&
                          year === today.getFullYear() &&
                          month === today.getMonth() + 1 &&
                          d === today.getDate()
                        );
                      })();
                      return (
                        <SelectItem key={d} value={d.toString()} disabled={isToday}>
                          {d}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('events.motto')}</Label>
              <Textarea
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder={t('events.motto')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('events.reminderFrequency')}</Label>
              <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder={t('events.selectFrequency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('events.frequencies.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('events.frequencies.weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('events.frequencies.monthly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4">
              {onDelete && (
                <Button type="button" variant="destructive" onClick={onDelete}>
                  {t('common.delete')}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {initialData ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventForm;
