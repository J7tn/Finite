/** @tsx */
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  birthDate?: Date;
  motto?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  onSave?: (settings: { birthDate: Date; motto: string; frequency: 'daily' | 'weekly' | 'monthly' }) => void;
  isDarkMode?: boolean;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  open = true,
  onOpenChange = () => {},
  birthDate = new Date(1990, 0, 1),
  motto = "Make every second count",
  frequency = 'daily',
  onSave = () => {},
  isDarkMode = false,
}) => {
  const [date, setDate] = useState<Date | undefined>(birthDate);
  const [personalMotto, setPersonalMotto] = useState<string>(motto);
  const [selectedMonth, setSelectedMonth] = useState<Date>(birthDate);
  const [notifFrequency, setNotifFrequency] = useState<'daily' | 'weekly' | 'monthly'>(frequency);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleYearChange = (year: number) => {
    const newDate = new Date(date || new Date());
    newDate.setFullYear(year);
    setDate(newDate);
    setSelectedMonth(newDate);
  };

  const handleMonthChange = (month: number) => {
    const newDate = new Date(date || new Date());
    newDate.setMonth(month);
    setDate(newDate);
    setSelectedMonth(newDate);
  };

  const handleSave = () => {
    if (date) {
      onSave({ birthDate: date, motto: personalMotto, frequency: notifFrequency });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold font-mono">
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="birthdate" className="text-left">
              Birth Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="birthdate"
                  className={cn(
                    `w-full justify-start text-left font-normal border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground ${isDarkMode ? 'text-white placeholder:text-white' : 'text-black placeholder:text-black'}`,
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2">
                  <div className="flex gap-2 mb-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={date ? date.getFullYear() : new Date().getFullYear()}
                      onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    >
                      {Array.from(
                        { length: 100 },
                        (_, i) => new Date().getFullYear() - i,
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={date ? date.getMonth() : new Date().getMonth()}
                      onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                    >
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((month, index) => (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={selectedMonth}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motto" className="text-left">
              Personal Motto
            </Label>
            <Input
              id="motto"
              value={personalMotto}
              onChange={(e) => setPersonalMotto(e.target.value)}
              placeholder="Enter your personal motto"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frequency" className="text-left">
              Notification Frequency
            </Label>
            <select
              id="frequency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={notifFrequency}
              onChange={e => setNotifFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div className="my-4 p-4 border rounded-lg bg-muted">
          <button
            type="button"
            className="w-full text-left font-medium text-blue-700 dark:text-blue-300 hover:underline focus:outline-none"
            onClick={() => setShowSuggestions((prev) => !prev)}
          >
            Need suggestions?
          </button>
          {showSuggestions && (
            <ul className="mt-3 space-y-2 text-sm text-blue-900 dark:text-blue-100">
              <li>Spouse's Birthday</li>
              <li>Wedding Anniversary</li>
              <li>Special Day</li>
              <li>Next Vacation</li>
              <li>Retirement</li>
              <li>Graduation</li>
              <li>Milestone Birthday</li>
              <li>Favorite Holiday</li>
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button 
            className={`border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground ${isDarkMode ? 'text-white disabled:text-white' : 'text-black disabled:text-black'}`}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsMenu;
