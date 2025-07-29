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
  ticking?: boolean; // Whether to play ticking sound
  showLifeExpectancyNote?: boolean; // Whether to show the lifespan note
  muted?: boolean; // Whether to mute all sounds
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
  ticking = false,
  showLifeExpectancyNote = true,
  muted = false,
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
  const tickingRef = useRef<HTMLAudioElement>(null);
  const TICKING_VOLUME = 0.25;
  const minuteTickRef = useRef<HTMLAudioElement>(null);
  const prevMinuteRef = useRef<number | null>(null);
  const didMountRef = useRef(false);
  const hasPlayedMinuteTickRef = useRef(false);

  const fadeTicking = (to: number, duration = 1000) => {
    if (!tickingRef.current) return;
    const from = tickingRef.current.volume;
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;
    const fade = () => {
      currentStep++;
      tickingRef.current!.volume = from + (to * TICKING_VOLUME - from) * (currentStep / steps);
      if (currentStep < steps) setTimeout(fade, stepTime);
      else tickingRef.current!.volume = to * TICKING_VOLUME;
    };
    fade();
  };

  // Unified timer for ticking sound and countdown update
  useEffect(() => {
    if (!tickingRef.current) return;
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;
    let stopped = false;

    const isLifeCountdown = eventType === 'lifeCountdown' || eventName === 'Life Countdown';
    const localStorageKey = eventId ? `event_notified_${eventId}` : undefined;

    const calculateAndUpdate = async () => {
      const now = new Date();
      let expiredFlag = false;
      let tr = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isNegative: false };
      let percent = 0;
      if (startDate && targetDate) {
        const total = targetDate.getTime() - startDate.getTime();
        const elapsed = now.getTime() - startDate.getTime();
        percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
        const diff = targetDate.getTime() - now.getTime();
        let isNegative = false;
        let absDiff = diff;
        if (isLifeCountdown && diff < 0) {
          isNegative = true;
          absDiff = Math.abs(diff);
        }
        if (!isLifeCountdown && diff <= 0) {
          expiredFlag = true;
          if (!notificationSentRef.current && localStorageKey && !localStorage.getItem(localStorageKey)) {
            notificationSentRef.current = true;
            localStorage.setItem(localStorageKey, 'true');
            await notificationService.requestPermission();
            await notificationService.sendEventArrivedNotification(eventName || "Your event");
          }
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
        tr = { years, months, days, hours, minutes, seconds, isNegative };
      } else if (targetDate) {
        const diff = targetDate.getTime() - now.getTime();
        let isNegative = false;
        let absDiff = diff;
        if (isLifeCountdown && diff < 0) {
          isNegative = true;
          absDiff = Math.abs(diff);
        }
        if (!isLifeCountdown && diff <= 0) {
          expiredFlag = true;
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
        tr = { years, months, days, hours, minutes, seconds, isNegative };
        percent = Math.min(100, Math.max(0, 100 - (diff / (targetDate.getTime() - now.getTime())) * 100));
      } else {
        const ageInMilliseconds = now.getTime() - birthDate.getTime();
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
        const lifeExpectancy = 73.5;
        const remainingYears = lifeExpectancy - ageInYears;
        percent = (ageInYears / lifeExpectancy) * 100;
        let isNegative = false;
        let absYears = remainingYears;
        if (isLifeCountdown && remainingYears < 0) {
          isNegative = true;
          absYears = Math.abs(remainingYears);
        }
        if (!isLifeCountdown && remainingYears <= 0) {
          expiredFlag = true;
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
        tr = { years, months, days, hours, minutes, seconds, isNegative };
      }
      setTimeRemaining(tr);
      setPercentageLived(percent);
      setExpired(expiredFlag);
    };

    const tick = async () => {
      await calculateAndUpdate();
      console.log(`Tick function called - ticking: ${ticking}, muted: ${muted}, eventName: ${eventName}, eventType: ${eventType}`);
      if (ticking && tickingRef.current && !muted) {
        console.log(`Attempting to play ticking sound for ${eventName || 'custom event'}`);
        console.log(`Audio readyState: ${tickingRef.current.readyState}, paused: ${tickingRef.current.paused}`);
        
        // Ensure audio is ready
        if (tickingRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
          tickingRef.current.currentTime = 0;
          tickingRef.current.volume = TICKING_VOLUME;
          tickingRef.current.play().catch((error) => {
            console.error('Failed to play ticking sound:', error);
          });
        } else {
          console.log('Audio not ready yet, readyState:', tickingRef.current.readyState);
        }
      } else {
        console.log(`Not playing ticking sound - ticking: ${ticking}, muted: ${muted}, audioRef: ${!!tickingRef.current}`);
      }
    };

    // Initial update
    calculateAndUpdate();

    // Calculate ms until next second boundary
    const msToNextSecond = 1000 - (Date.now() % 1000);
    timeout = setTimeout(() => {
      if (stopped) return;
      tick();
      interval = setInterval(tick, 1000);
    }, msToNextSecond);

    return () => {
      stopped = true;
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      if (tickingRef.current) {
        tickingRef.current.pause();
        tickingRef.current.volume = 0;
      }
    };
  // Only rerun if these change
  }, [birthDate, targetDate, startDate, eventName, eventId, eventType, ticking, muted]);

  // Play minute tick sound when minute changes (unchanged)
  useEffect(() => {
    if (!minuteTickRef.current) return;
    const currentMinute = timeRemaining.minutes;
    if (didMountRef.current && prevMinuteRef.current !== null && currentMinute !== prevMinuteRef.current) {
      if (hasPlayedMinuteTickRef.current && !muted) {
        minuteTickRef.current.currentTime = 0;
        minuteTickRef.current.volume = 0.3;
        minuteTickRef.current.play().catch(() => {});
      } else {
        hasPlayedMinuteTickRef.current = true;
      }
    }
    prevMinuteRef.current = currentMinute;
  }, [timeRemaining.minutes, muted]);

  // Set didMountRef.current to true after first render (unchanged)
  useEffect(() => {
    didMountRef.current = true;
    hasPlayedMinuteTickRef.current = false;
    
    // Debug audio element creation
    console.log(`CountdownTimer mounted - tickingRef: ${!!tickingRef.current}, eventName: ${eventName}, eventType: ${eventType}`);
    if (tickingRef.current) {
      tickingRef.current.addEventListener('loadstart', () => console.log('Ticking audio loadstart'));
      tickingRef.current.addEventListener('canplay', () => console.log('Ticking audio canplay'));
      tickingRef.current.addEventListener('error', (e) => console.error('Ticking audio error:', e));
    }
  }, [eventName, eventType]);

  // Mute/unmute all sounds (unchanged)
  useEffect(() => {
    if (minuteTickRef.current) minuteTickRef.current.muted = muted;
    // Don't mute tickingRef here as we control it via volume in the tick function
  }, [muted]);

  // Helper to check if this is a life countdown (should keep counting after 0)
  const isLifeCountdown = eventType === 'lifeCountdown' || eventName === 'Life Countdown';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full h-full flex flex-col justify-center items-center"
    >
      <audio
        ref={tickingRef}
        src="/clockSecondsTicking.mp3"
        preload="auto"
        style={{ display: 'none' }}
        onLoadStart={() => console.log('Ticking audio loadstart')}
        onCanPlay={() => console.log('Ticking audio canplay')}
        onError={(e) => console.error('Ticking audio error:', e)}
      />
      <audio
        ref={minuteTickRef}
        src="/clockMinuteTick.mp3"
        preload="auto"
        style={{ display: 'none' }}
        onLoadStart={() => console.log('Minute tick audio loadstart')}
        onCanPlay={() => console.log('Minute tick audio canplay')}
        onError={(e) => console.error('Minute tick audio error:', e)}
      />
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
          {isLifeCountdown && showLifeExpectancyNote && (
            <div className="text-xs italic text-muted-foreground mt-2 text-center">
              Based on the average global lifespan of 73.5 years.
            </div>
          )}

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
