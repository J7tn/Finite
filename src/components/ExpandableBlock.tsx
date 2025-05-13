import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

interface Event {
  id: string;
  name: string;
  date: Date;
  motto: string;
}

interface ExpandableBlockProps {
  birthDate?: Date;
  motto?: string;
  age?: number;
  onAddEvent?: () => void;
  events?: Event[];
  eventName?: string;
  targetDate?: Date;
}

const ExpandableBlock = ({
  birthDate = new Date(1990, 0, 1),
  motto = "Make every second count",
  age,
  onAddEvent,
  events = [],
  eventName,
  targetDate,
}: ExpandableBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEventSelect = (id: string) => {
    setSelectedEventId(id === selectedEventId ? null : id);
  };

  return (
    <div className="w-full">
      <Card className="bg-card mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{eventName || "Life Countdown"}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <CountdownTimer
                    birthDate={targetDate ? undefined : birthDate}
                    motto={motto}
                    age={age}
                    targetDate={targetDate}
                  />

                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-2">Your Events</h4>
                    {events.length > 0 ? (
                      <div className="space-y-2">
                        {events.map((event) => (
                          <Card
                            key={event.id}
                            className={`cursor-pointer ${selectedEventId === event.id ? "border-primary" : ""}`}
                            onClick={() => handleEventSelect(event.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="font-medium">{event.name}</h5>
                                  <p className="text-sm text-muted-foreground">
                                    {event.date.toLocaleDateString()}
                                  </p>
                                </div>
                                <ChevronDown
                                  size={16}
                                  className={`transition-transform ${selectedEventId === event.id ? "rotate-180" : ""}`}
                                />
                              </div>

                              <AnimatePresence>
                                {selectedEventId === event.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="pt-2"
                                  >
                                    <CountdownTimer
                                      birthDate={new Date()}
                                      motto={event.motto}
                                      age={0}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No events yet. Add your first event below.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpandableBlock;
