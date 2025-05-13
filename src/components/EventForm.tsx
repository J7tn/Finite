import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";

interface EventFormProps {
  onSubmit: (event: { name: string; date: Date; motto: string }) => void;
  onCancel: () => void;
  initialName?: string;
  initialDate?: Date;
  initialMotto?: string;
  onDelete?: () => void;
}

const EventForm = ({ onSubmit, onCancel, initialName = "", initialDate, initialMotto = "", onDelete }: EventFormProps) => {
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [motto, setMotto] = useState(initialMotto);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !motto) return;

    onSubmit({
      name,
      date,
      motto,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full"
    >
      <Card className="bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="event-name"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Event Name
              </label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Event Date
              </label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border-0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="event-motto"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Custom Motto
              </label>
              <Textarea
                id="event-motto"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="Enter a custom motto for this event"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              {onDelete && (
                <Button type="button" variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name || !date || !motto}>
                {onDelete ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventForm;
