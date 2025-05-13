import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { LifeProgressBar } from "./LifeProgressBar";

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
                    progressLabel={eventName ? "Current Progress" : undefined}
                  />
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
