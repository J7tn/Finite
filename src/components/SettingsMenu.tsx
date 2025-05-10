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
  onSave?: (settings: { birthDate: Date; motto: string }) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  open = true,
  onOpenChange = () => {},
  birthDate = new Date(1990, 0, 1),
  motto = "Make every second count",
  onSave = () => {},
}) => {
  const [date, setDate] = useState<Date | undefined>(birthDate);
  const [personalMotto, setPersonalMotto] = useState<string>(motto);

  const handleSave = () => {
    if (date) {
      onSave({ birthDate: date, motto: personalMotto });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
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
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsMenu;
