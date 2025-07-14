import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { LifeProgressBar } from './LifeProgressBar';
import { t } from '@/services/translation';

interface Event {
  id: string;
  name: string;
  date: Date;
  motto: string;
}

interface ExpandableBlockProps {
  eventName?: string;
  motto?: string;
  targetDate: Date;
  eventType?: string;
  lifeExpectancy?: number;
  isExpanded: boolean;
  onExpand: () => void;
  onEdit: () => void;
}

const ExpandableBlock: React.FC<ExpandableBlockProps> = ({
  eventName,
  motto,
  targetDate,
  eventType = 'custom',
  lifeExpectancy,
  isExpanded,
  onExpand,
  onEdit
}) => {
  const [timeLeft, setTimeLeft] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }

      // Calculate years
      const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
      const remainingAfterYears = difference - (years * 1000 * 60 * 60 * 24 * 365.25);

      // Calculate months
      const months = Math.floor(remainingAfterYears / (1000 * 60 * 60 * 24 * 30.44));
      const remainingAfterMonths = remainingAfterYears - (months * 1000 * 60 * 60 * 24 * 30.44);

      // Calculate days
      const days = Math.floor(remainingAfterMonths / (1000 * 60 * 60 * 24));
      const remainingAfterDays = remainingAfterMonths - (days * 1000 * 60 * 60 * 24);

      // Calculate hours
      const hours = Math.floor(remainingAfterDays / (1000 * 60 * 60));
      const remainingAfterHours = remainingAfterDays - (hours * 1000 * 60 * 60);

      // Calculate minutes
      const minutes = Math.floor(remainingAfterHours / (1000 * 60));
      const remainingAfterMinutes = remainingAfterHours - (minutes * 1000 * 60);

      // Calculate seconds
      const seconds = Math.floor(remainingAfterMinutes / 1000);

      setTimeLeft({ years, months, days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const calculateLifeProgress = () => {
    if (eventType !== 'lifeCountdown' || !lifeExpectancy) return null;

    const now = new Date();
    const birthDate = new Date(targetDate);
    const ageInYears = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const progress = (ageInYears / lifeExpectancy) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const lifeProgress = calculateLifeProgress();

  // Calculate target date for custom life countdown
  let countdownTargetDate = targetDate;
  if (eventType === 'lifeCountdown' && lifeExpectancy && targetDate instanceof Date) {
    countdownTargetDate = new Date(targetDate);
    countdownTargetDate.setFullYear(targetDate.getFullYear() + lifeExpectancy);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {eventName || t('events.lifeCountdown')}
          </h3>
          {motto && <p className="text-sm text-muted-foreground mt-1">{motto}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={e => { e.stopPropagation(); onExpand(); }}
          className="ml-2 expand-btn"
          style={{ position: 'relative', zIndex: 10 }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {eventName === t('events.lifeCountdown') ? (
                <CountdownTimer
                  birthDate={targetDate}
                  expectedLifespan={73.5}
                  motto={motto}
                  eventType={eventType}
                  ticking={isExpanded}
                />
              ) : eventType === 'lifeCountdown' ? (
                <CountdownTimer
                  birthDate={targetDate}
                  targetDate={countdownTargetDate}
                  expectedLifespan={lifeExpectancy}
                  motto={motto}
                  eventType={eventType}
                  ticking={isExpanded}
                  showLifeExpectancyNote={false}
                />
              ) : (
                <CountdownTimer targetDate={targetDate} motto={motto} eventName={eventName} eventId={eventName} eventType={eventType} 
                  ticking={isExpanded}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isExpanded && (
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={onEdit}
            className="w-full"
          >
            {eventName ? t('events.editEvent') : t('events.editLifeCountdown')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExpandableBlock;
