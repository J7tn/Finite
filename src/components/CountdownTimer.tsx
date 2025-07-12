import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LifeProgressBar } from "./LifeProgressBar";
import { notificationService } from "@/services/notificationService";

interface CountdownTimerProps {
  birthDate?: Date;
  motto?: string;
  age?: number;
  targetDate?: Date;
  startDate?: Date;
  progressLabel?: string;
  expectedLifespan?: number;
  eventName?: string; // For notification message
  eventId?: string;   // For notification uniqueness
  eventType?: string; // To distinguish lifeCountdown types
}

const CountdownTimer = ({
  birthDate = new Date(1990, 0, 1),
  motto = "Make every second count",
  age,
  targetDate,
  startDate,
  progressLabel,
  expectedLifespan = 73.5,
  eventName,
  eventId,
  eventType,
}: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isNegative: false,
  });
  const [percentageLived, setPercentageLived] = useState(0);
  const [expired, setExpired] = useState(false);
  const notificationSentRef = useRef(false);

  // Helper to check if this is a life countdown (should keep counting after 0)
  const isLifeCountdown = eventType === 'lifeCountdown' || eventName === 'Life Countdown';

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const localStorageKey = eventId ? `event_notified_${eventId}` : undefined;

    const calculateTimeRemaining = async () => {
      const now = new Date();
      if (startDate && targetDate) {
        // Custom event progress: from startDate to targetDate
        const total = targetDate.getTime() - startDate.getTime();
        const elapsed = now.getTime() - startDate.getTime();
        setPercentageLived(Math.min(100, Math.max(0, (elapsed / total) * 100)));
        const diff = targetDate.getTime() - now.getTime();
        let isNegative = false;
        let absDiff = diff;
        if (isLifeCountdown && diff < 0) {
          isNegative = true;
          absDiff = Math.abs(diff);
        }
        if (!isLifeCountdown && diff <= 0) {
          setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isNegative: false });
          setExpired(true);
          // Only send notification once
          if (!notificationSentRef.current && localStorageKey && !localStorage.getItem(localStorageKey)) {
            notificationSentRef.current = true;
            localStorage.setItem(localStorageKey, 'true');
            await notificationService.requestPermission();
            await notificationService.sendEventArrivedNotification(eventName || "Your event");
          }
          if (interval) clearInterval(interval);
          return;
        }
        let remaining = absDiff / 1000;
        const years = Math.floor(remaining / (60 * 60 * 24 * 365.25));
        remaining -= years * 60 * 60 * 24 * 365.25;
        const months = Math.floor(remaining / (60 * 60 * 24 * 30.44));
        remaining -= months * 60 * 60 * 24 * 30.44;
        const days = Math.floor(remaining / (60 * 60 * 24));
        remaining -= days * 60 * 60 * 24;
        const hours = Math.floor(remaining / (60 * 60));
        remaining -= hours * 60 * 60;
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining - minutes * 60);
        setTimeRemaining({ years, months, days, hours, minutes, seconds, isNegative });
        setExpired(false);
      } else if (targetDate) {
        // ... existing event countdown logic ...
        const diff = targetDate.getTime() - now.getTime();
        let isNegative = false;
        let absDiff = diff;
        if (isLifeCountdown && diff < 0) {
          isNegative = true;
          absDiff = Math.abs(diff);
        }
        if (!isLifeCountdown && diff <= 0) {
          setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isNegative: false });
          setPercentageLived(100);
          setExpired(true);
          return;
        }
        let remaining = absDiff / 1000;
        const years = Math.floor(remaining / (60 * 60 * 24 * 365.25));
        remaining -= years * 60 * 60 * 24 * 365.25;
        const months = Math.floor(remaining / (60 * 60 * 24 * 30.44));
        remaining -= months * 60 * 60 * 24 * 30.44;
        const days = Math.floor(remaining / (60 * 60 * 24));
        remaining -= days * 60 * 60 * 24;
        const hours = Math.floor(remaining / (60 * 60));
        remaining -= hours * 60 * 60;
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining - minutes * 60);
        setTimeRemaining({ years, months, days, hours, minutes, seconds, isNegative });
        const total = targetDate.getTime() - now.getTime() + (now.getTime() - now.getTime());
        const elapsed = now.getTime() - now.getTime();
        setPercentageLived(Math.min(100, Math.max(0, 100 - (diff / (targetDate.getTime() - now.getTime())) * 100)));
        setExpired(false);
      } else {
        // ... existing life countdown logic ...
        const ageInMilliseconds = now.getTime() - birthDate.getTime();
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
        const lifeExpectancy = 73.5;
        const remainingYears = lifeExpectancy - ageInYears;
        const percentLived = (ageInYears / lifeExpectancy) * 100;
        setPercentageLived(percentLived);
        let isNegative = false;
        let absYears = remainingYears;
        if (isLifeCountdown && remainingYears < 0) {
          isNegative = true;
          absYears = Math.abs(remainingYears);
        }
        if (!isLifeCountdown && remainingYears <= 0) {
          setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isNegative: false });
          setExpired(true);
          return;
        }
        const years = Math.floor(absYears);
        const monthsDecimal = (absYears - years) * 12;
        const months = Math.floor(monthsDecimal);
        const daysDecimal = (monthsDecimal - months) * 30.44;
        const days = Math.floor(daysDecimal);
        const hoursDecimal = (daysDecimal - days) * 24;
        const hours = Math.floor(hoursDecimal);
        const minutesDecimal = (hoursDecimal - hours) * 60;
        const minutes = Math.floor(minutesDecimal);
        const seconds = Math.floor((minutesDecimal - minutes) * 60);
        setTimeRemaining({ years, months, days, hours, minutes, seconds, isNegative });
        setExpired(false);
      }
    };
    calculateTimeRemaining();
    interval = setInterval(calculateTimeRemaining, 1000);
    return () => interval && clearInterval(interval);
  }, [birthDate, targetDate, startDate, eventName, eventId, eventType]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full h-full flex flex-col justify-center items-center"
    >
      <Card className="flex flex-col w-full h-full bg-card">
        <CardContent className="flex-1 w-full flex flex-col justify-center items-center p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground font-mono">
            {expired && !isLifeCountdown ? (eventName ? `${eventName} has arrived!` : "Event has arrived!") : "Time Remaining"}
          </h2>

          {!expired || isLifeCountdown ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <TimeUnit value={timeRemaining.years} label="Years" isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.months} label="Months" isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.days} label="Days" isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.hours} label="Hours" isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.minutes} label="Minutes" isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.seconds} label="Seconds" highlight isNegative={timeRemaining.isNegative} />
            </div>
          ) : (
            <div className="text-xl text-green-600 dark:text-green-400 font-semibold mb-6">
              {eventName ? `${eventName} has arrived!` : "Event has arrived!"}
            </div>
          )}

          <LifeProgressBar 
            birthDate={birthDate}
            expectedLifespan={expectedLifespan}
            progressLabel={progressLabel}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center mt-4 p-4 bg-muted rounded-md"
          >
            <p className="text-lg italic text-muted-foreground">"{motto}"</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface TimeUnitProps {
  value: number;
  label: string;
  highlight?: boolean;
  isNegative?: boolean;
}

const TimeUnit = ({ value, label, highlight = false, isNegative = false }: TimeUnitProps) => (
  <div className="flex flex-col items-center">
    <div
      className={`text-3xl font-bold mb-1 font-mono ${highlight ? "text-primary" : "text-foreground"}`}
    >
      {isNegative ? `+${value.toString().padStart(2, "0")}` : value.toString().padStart(2, "0")}
    </div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export default CountdownTimer;
