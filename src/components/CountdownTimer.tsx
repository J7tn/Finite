import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  birthDate?: Date;
  motto?: string;
}

const CountdownTimer = ({
  birthDate = new Date(1990, 0, 1),
  motto = "Make every second count",
}: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const ageInMilliseconds = now.getTime() - birthDate.getTime();
      const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

      // Global average life expectancy is 73.5 years
      const lifeExpectancy = 73.5;
      const remainingYears = lifeExpectancy - ageInYears;

      if (remainingYears <= 0) {
        setTimeRemaining({
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const years = Math.floor(remainingYears);
      const monthsDecimal = (remainingYears - years) * 12;
      const months = Math.floor(monthsDecimal);
      const daysDecimal = (monthsDecimal - months) * 30.44; // Average days in a month
      const days = Math.floor(daysDecimal);
      const hoursDecimal = (daysDecimal - days) * 24;
      const hours = Math.floor(hoursDecimal);
      const minutesDecimal = (hoursDecimal - hours) * 60;
      const minutes = Math.floor(minutesDecimal);
      const seconds = Math.floor((minutesDecimal - minutes) * 60);

      setTimeRemaining({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [birthDate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-4 bg-background">
      <Card className="w-full max-w-md bg-card shadow-lg border-0">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
            Time Remaining
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <TimeUnit value={timeRemaining.years} label="Years" />
            <TimeUnit value={timeRemaining.months} label="Months" />
            <TimeUnit value={timeRemaining.days} label="Days" />
            <TimeUnit value={timeRemaining.hours} label="Hours" />
            <TimeUnit value={timeRemaining.minutes} label="Minutes" />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex flex-col items-center"
            >
              <TimeUnit
                value={timeRemaining.seconds}
                label="Seconds"
                highlight
              />
            </motion.div>
          </div>

          <div className="text-center mt-6 p-4 bg-muted rounded-md">
            <p className="text-lg italic text-muted-foreground">"{motto}"</p>
          </div>
        </CardContent>
      </Card>
    </div>
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
      className={`text-3xl font-bold mb-1 ${highlight ? "text-primary" : "text-foreground"}`}
    >
      {value.toString().padStart(2, "0")}
    </div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export default CountdownTimer;
