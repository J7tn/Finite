import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LifeProgressBar } from "./LifeProgressBar";

interface CountdownTimerProps {
  birthDate?: Date;
  motto?: string;
  age?: number;
  targetDate?: Date;
  startDate?: Date;
  progressLabel?: string;
}

const CountdownTimer = ({
  birthDate = new Date(1990, 0, 1),
  motto = "Make every second count",
  age,
  targetDate,
  startDate,
  progressLabel,
}: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [percentageLived, setPercentageLived] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      if (startDate && targetDate) {
        // Custom event progress: from startDate to targetDate
        const total = targetDate.getTime() - startDate.getTime();
        const elapsed = now.getTime() - startDate.getTime();
        setPercentageLived(Math.min(100, Math.max(0, (elapsed / total) * 100)));
        const diff = targetDate.getTime() - now.getTime();
        if (diff <= 0) {
          setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }
        let remaining = diff / 1000;
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
        setTimeRemaining({ years, months, days, hours, minutes, seconds });
      } else if (targetDate) {
        // ... existing event countdown logic ...
        const diff = targetDate.getTime() - now.getTime();
        if (diff <= 0) {
          setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
          setPercentageLived(100);
          return;
        }
        let remaining = diff / 1000;
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
        setTimeRemaining({ years, months, days, hours, minutes, seconds });
        const total = targetDate.getTime() - now.getTime() + (now.getTime() - now.getTime());
        const elapsed = now.getTime() - now.getTime();
        setPercentageLived(Math.min(100, Math.max(0, 100 - (diff / (targetDate.getTime() - now.getTime())) * 100)));
      } else {
        // ... existing life countdown logic ...
        const ageInMilliseconds = now.getTime() - birthDate.getTime();
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
        const lifeExpectancy = 73.5;
        const remainingYears = lifeExpectancy - ageInYears;
        const percentLived = (ageInYears / lifeExpectancy) * 100;
        setPercentageLived(percentLived);
        if (remainingYears <= 0) {
          setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }
        const years = Math.floor(remainingYears);
        const monthsDecimal = (remainingYears - years) * 12;
        const months = Math.floor(monthsDecimal);
        const daysDecimal = (monthsDecimal - months) * 30.44;
        const days = Math.floor(daysDecimal);
        const hoursDecimal = (daysDecimal - days) * 24;
        const hours = Math.floor(hoursDecimal);
        const minutesDecimal = (hoursDecimal - hours) * 60;
        const minutes = Math.floor(minutesDecimal);
        const seconds = Math.floor((minutesDecimal - minutes) * 60);
        setTimeRemaining({ years, months, days, hours, minutes, seconds });
      }
    };
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [birthDate, targetDate, startDate]);

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
            Time Remaining
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <TimeUnit value={timeRemaining.years} label="Years" />
            <TimeUnit value={timeRemaining.months} label="Months" />
            <TimeUnit value={timeRemaining.days} label="Days" />
            <TimeUnit value={timeRemaining.hours} label="Hours" />
            <TimeUnit value={timeRemaining.minutes} label="Minutes" />
            <TimeUnit value={timeRemaining.seconds} label="Seconds" highlight />
          </div>

          <LifeProgressBar 
            birthDate={startDate && targetDate ? startDate : (targetDate ? new Date() : birthDate)}
            expectedLifespan={startDate && targetDate ? (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25) : (targetDate ? ((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 73.5)}
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
}

const TimeUnit = ({ value, label, highlight = false }: TimeUnitProps) => (
  <div className="flex flex-col items-center">
    <div
      className={`text-3xl font-bold mb-1 font-mono ${highlight ? "text-primary" : "text-foreground"}`}
    >
      {value.toString().padStart(2, "0")}
    </div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export default CountdownTimer;
