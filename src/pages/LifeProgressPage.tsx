import React, { useState, useEffect } from 'react';
import { LifeProgressBar } from '@/components/LifeProgressBar';
import { ReminderSettings, type ReminderSettings as ReminderSettingsType } from '@/components/ReminderSettings';
import { notificationService } from '@/services/notificationService';
import { calculateRemainingTime, formatRemainingTime } from '@/utils/timeCalculations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function LifeProgressPage() {
  const [birthDate, setBirthDate] = useState<Date>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 30);
    return date;
  });
  const [expectedLifespan, setExpectedLifespan] = useState(80);
  const [remainingTime, setRemainingTime] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 30);
    return date;
  });

  // Generate years (from 1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => currentYear - i
  );

  // Generate months
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

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

  const handleYearChange = (year: string) => {
    const newDate = new Date(birthDate);
    newDate.setFullYear(parseInt(year));
    setBirthDate(newDate);
    setSelectedMonth(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(birthDate);
    newDate.setMonth(parseInt(month));
    setBirthDate(newDate);
    setSelectedMonth(newDate);
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      setBirthDate(date);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Life Progress Tracker</h1>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Birth Date
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Year</label>
              <Select
                value={birthDate.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Month</label>
              <Select
                value={birthDate.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <DayPicker
              mode="single"
              selected={birthDate}
              onSelect={handleDaySelect}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              className="rounded-md border"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                ),
                day_range_end: "day-range-end",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                  "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
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