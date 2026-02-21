import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { Label } from "@/components/ui/label";
import { DEFAULT_LIFE_EXPECTANCY } from "@/types";

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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

const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel, onDelete, initialData }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialData?.name || '');
  const [motto, setMotto] = useState(initialData?.motto || '');
  const [notificationFrequency, setNotificationFrequency] = useState(initialData?.notificationFrequency || 'monthly');
  const [type, setType] = useState(initialData?.type || 'custom');
  const [lifeExpectancy, setLifeExpectancy] = useState(initialData?.lifeExpectancy?.toString() || String(DEFAULT_LIFE_EXPECTANCY));
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState(initialData?.date ? initialData.date.getFullYear() : new Date().getFullYear());
  const [month, setMonth] = useState(initialData?.date ? initialData.date.getMonth() + 1 : new Date().getMonth() + 1);
  const [day, setDay] = useState(initialData?.date ? initialData.date.getDate() : new Date().getDate());

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 100; y <= currentYear + 100; y++) years.push(y);
    return years;
  };

  const generateMonthOptions = () => Array.from({ length: 12 }, (_, i) => i + 1);

  const generateDayOptions = (y: number, m: number) => {
    const daysInMonth = new Date(y, m, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('events.errorNameRequired'));
      return;
    }

    if (type === 'lifeCountdown') {
      const exp = parseInt(lifeExpectancy);
      if (isNaN(exp) || exp < 1 || exp > 150) {
        setError(t('events.errorInvalidExpectancy'));
        return;
      }
    }

    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (type === 'custom' && date <= today) {
      setError(t('events.errorPastDate'));
      return;
    }

    setError(null);
    onSubmit({
      name: name.trim(),
      date,
      motto,
      notificationFrequency,
      type,
      lifeExpectancy: type === 'lifeCountdown' ? parseInt(lifeExpectancy) : undefined
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <div className="space-y-2">
              <Label>{t('events.type')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder={t('events.selectType')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t('events.types.custom')}</SelectItem>
                  <SelectItem value="lifeCountdown">{t('events.types.lifeCountdown')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('events.name')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('events.name')} required />
            </div>

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
              <Label htmlFor="date">{type === 'lifeCountdown' ? t('events.birthDate') : t('events.date')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder={t('common.year')} /></SelectTrigger>
                  <SelectContent>
                    {generateYearOptions().map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder={t('common.month')} /></SelectTrigger>
                  <SelectContent>
                    {generateMonthOptions().map((m) => (
                      <SelectItem key={m} value={m.toString()}>{MONTH_NAMES[m - 1]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={day.toString()} onValueChange={(v) => setDay(parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder={t('common.day')} /></SelectTrigger>
                  <SelectContent>
                    {generateDayOptions(year, month).map((d) => (
                      <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('events.motto')}</Label>
              <Textarea value={motto} onChange={(e) => setMotto(e.target.value)} placeholder={t('events.motto')} />
            </div>

            <div className="space-y-2">
              <Label>{t('events.reminderFrequency')}</Label>
              <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                <SelectTrigger><SelectValue placeholder={t('events.selectFrequency')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('events.frequencies.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('events.frequencies.weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('events.frequencies.monthly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4">
              {onDelete && (
                <Button type="button" variant="destructive" onClick={onDelete}>{t('common.delete')}</Button>
              )}
              <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
              <Button type="submit">{initialData ? t('common.save') : t('common.create')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventForm;
