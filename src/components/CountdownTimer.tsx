import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ProgressBar } from "./LifeProgressBar";
import { notificationService } from "@/services/notificationService";
import { useTranslation } from "@/contexts/TranslationContext";
import { DEFAULT_LIFE_EXPECTANCY } from "@/types";

interface CountdownTimerProps {
  birthDate?: Date;
  motto?: string;
  age?: number;
  targetDate?: Date;
  startDate?: Date;
  progressLabel?: string;
  expectedLifespan?: number;
  eventName?: string;
  eventId?: string;
  eventType?: string;
  ticking?: boolean;
  showLifeExpectancyNote?: boolean;
  muted?: boolean;
  volume?: number;
}

const CountdownTimer = ({
  birthDate = new Date(1990, 0, 1),
  motto,
  targetDate,
  startDate,
  progressLabel,
  expectedLifespan = DEFAULT_LIFE_EXPECTANCY,
  eventName,
  eventId,
  eventType,
  ticking = false,
  showLifeExpectancyNote = true,
  muted = false,
  volume = 0.1,
}: CountdownTimerProps) => {
  const { t } = useTranslation();
  const defaultMotto = t('common.defaultMotto');
  const displayMotto = motto || defaultMotto;

  const [timeRemaining, setTimeRemaining] = useState({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isNegative: false,
  });
  const [percentageLived, setPercentageLived] = useState(0);
  const [expired, setExpired] = useState(false);
  const notificationSentRef = useRef(false);
  const minuteTickRef = useRef<HTMLAudioElement>(null);
  const prevMinuteRef = useRef<number | null>(null);
  const didMountRef = useRef(false);
  const hasPlayedMinuteTickRef = useRef(false);

  const secondTickOneRef = useRef<HTMLAudioElement>(null);
  const prevSecondRef = useRef<number | null>(null);
  const hasPlayedSecondTickRef = useRef(false);

  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeDuration = 150;
  const targetVolume = volume;

  const fadeOutTick = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    const startVol = audioRef.current.volume;
    const step = startVol / (fadeDuration / 16);
    let cur = startVol;
    fadeIntervalRef.current = setInterval(() => {
      cur -= step;
      if (cur <= 0) {
        cur = 0;
        audioRef.current?.pause();
        if (fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
      }
      if (audioRef.current) audioRef.current.volume = cur;
    }, 16);
  };

  const isLifeCountdown = eventType === 'lifeCountdown';

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    let stopped = false;
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
        let isNeg = false;
        let absDiff = diff;
        if (isLifeCountdown && diff < 0) { isNeg = true; absDiff = Math.abs(diff); }
        if (!isLifeCountdown && diff <= 0) {
          expiredFlag = true;
          if (!notificationSentRef.current && localStorageKey && !localStorage.getItem(localStorageKey)) {
            notificationSentRef.current = true;
            localStorage.setItem(localStorageKey, 'true');
            await notificationService.requestPermission();
            const evtName = eventName || t('events.lifeCountdown');
            await notificationService.sendEventArrivedNotification(
              t('notifications.eventArrived'),
              `${evtName} ${t('events.hasArrived')}`
            );
          }
        }
        tr = decomposeMs(absDiff, isNeg);
      } else if (targetDate) {
        const diff = targetDate.getTime() - now.getTime();
        let isNeg = false;
        let absDiff = diff;
        if (isLifeCountdown && diff < 0) { isNeg = true; absDiff = Math.abs(diff); }
        if (!isLifeCountdown && diff <= 0) expiredFlag = true;
        tr = decomposeMs(absDiff, isNeg);
      } else {
        const ageMs = now.getTime() - birthDate.getTime();
        const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
        const remainingYears = expectedLifespan - ageYears;
        percent = (ageYears / expectedLifespan) * 100;
        let isNeg = false;
        let absYears = remainingYears;
        if (isLifeCountdown && remainingYears < 0) { isNeg = true; absYears = Math.abs(remainingYears); }
        if (!isLifeCountdown && remainingYears <= 0) expiredFlag = true;
        tr = decomposeYears(absYears, isNeg);
      }
      setTimeRemaining(tr);
      setPercentageLived(percent);
      setExpired(expiredFlag);
    };

    const tick = async () => {
      await calculateAndUpdate();
      if (!stopped) {
        const msToNext = 1000 - (Date.now() % 1000);
        timeout = setTimeout(tick, msToNext);
      }
    };

    calculateAndUpdate();
    const msToNext = 1000 - (Date.now() % 1000);
    timeout = setTimeout(tick, msToNext);

    return () => { stopped = true; if (timeout) clearTimeout(timeout); };
  }, [birthDate, targetDate, startDate, eventName, eventId, eventType, ticking, muted, expectedLifespan]);

  useEffect(() => {
    if (!minuteTickRef.current) return;
    const cur = timeRemaining.minutes;
    if (didMountRef.current && prevMinuteRef.current !== null && cur !== prevMinuteRef.current) {
      if (hasPlayedMinuteTickRef.current && !muted) {
        minuteTickRef.current.currentTime = 0;
        minuteTickRef.current.volume = volume;
        minuteTickRef.current.play().catch(() => {});
      } else {
        hasPlayedMinuteTickRef.current = true;
      }
    }
    prevMinuteRef.current = cur;
  }, [timeRemaining.minutes, muted, volume]);

  useEffect(() => {
    if (!secondTickOneRef.current || !ticking) return;
    const cur = timeRemaining.seconds;
    if (didMountRef.current && prevSecondRef.current !== null && cur !== prevSecondRef.current) {
      if (hasPlayedSecondTickRef.current && !muted) {
        secondTickOneRef.current.currentTime = 0;
        secondTickOneRef.current.volume = targetVolume;
        secondTickOneRef.current.play().then(() => {
          setTimeout(() => fadeOutTick(secondTickOneRef), 600);
        }).catch(() => {});
      } else {
        hasPlayedSecondTickRef.current = true;
      }
    }
    prevSecondRef.current = cur;
  }, [timeRemaining.seconds, ticking, muted, volume]);

  useEffect(() => {
    didMountRef.current = true;
    hasPlayedMinuteTickRef.current = false;
    hasPlayedSecondTickRef.current = false;
    return () => { if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current); };
  }, []);

  useEffect(() => {
    if (minuteTickRef.current) minuteTickRef.current.volume = volume;
    if (secondTickOneRef.current) secondTickOneRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (minuteTickRef.current) minuteTickRef.current.muted = muted;
    if (secondTickOneRef.current) secondTickOneRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (!ticking) {
      if (fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
      if (secondTickOneRef.current) { secondTickOneRef.current.pause(); secondTickOneRef.current.volume = 0; }
    }
  }, [ticking]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="w-full h-full flex flex-col justify-center items-center">
      <audio ref={minuteTickRef} src="/clockMinuteTick.mp3" preload="auto" style={{ display: 'none' }} />
      <audio ref={secondTickOneRef} src="/secondTickingOne.mp3" preload="auto" style={{ display: 'none' }} />
      <Card className="flex flex-col w-full h-full bg-card">
        <CardContent className="flex-1 w-full flex flex-col justify-center items-center p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground font-mono">
            {expired && !isLifeCountdown
              ? `${eventName || t('events.lifeCountdown')} ${t('events.hasArrived')}`
              : t("events.timeRemaining")}
          </h2>

          {!expired || isLifeCountdown ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <TimeUnit value={timeRemaining.years} label={t("common.years")} isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.months} label={t("common.months")} isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.days} label={t("common.days")} isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.hours} label={t("common.hours")} isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.minutes} label={t("common.minutes")} isNegative={timeRemaining.isNegative} />
              <TimeUnit value={timeRemaining.seconds} label={t("common.seconds")} highlight isNegative={timeRemaining.isNegative} />
            </div>
          ) : (
            <div className="text-xl text-green-600 dark:text-green-400 font-semibold mb-6">
              {`${eventName || t('events.lifeCountdown')} ${t('events.hasArrived')}`}
            </div>
          )}

          {isLifeCountdown ? (
            <ProgressBar
              birthDate={birthDate}
              expectedLifespan={expectedLifespan}
              startDate={startDate}
              targetDate={targetDate}
              progressLabel={progressLabel}
              allowProgressBeyond100={isLifeCountdown}
            />
          ) : targetDate ? (
            <ProgressBar
              startDate={startDate}
              targetDate={targetDate}
              progressLabel={progressLabel || t('common.progress')}
            />
          ) : null}

          {isLifeCountdown && showLifeExpectancyNote && (
            <div className="text-xs italic text-muted-foreground mt-2 text-center">
              {t("events.lifespanNote")}
            </div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-center mt-4 p-4 bg-muted rounded-md">
            <p className="text-lg italic text-muted-foreground">"{displayMotto}"</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function decomposeMs(ms: number, isNegative: boolean) {
  let remaining = ms / 1000;
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
  return { years, months, days, hours, minutes, seconds, isNegative };
}

function decomposeYears(absYears: number, isNegative: boolean) {
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
  return { years, months, days, hours, minutes, seconds, isNegative };
}

interface TimeUnitProps {
  value: number;
  label: string;
  highlight?: boolean;
  isNegative?: boolean;
}

const TimeUnit = ({ value, label, highlight = false, isNegative = false }: TimeUnitProps) => (
  <div className="flex flex-col items-center">
    <div className={`text-3xl font-bold mb-1 font-mono ${highlight ? "text-primary" : "text-foreground"}`}>
      {isNegative ? `+${value.toString().padStart(2, "0")}` : value.toString().padStart(2, "0")}
    </div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
  </div>
);

export default CountdownTimer;
