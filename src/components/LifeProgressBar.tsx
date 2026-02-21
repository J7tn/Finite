import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/contexts/TranslationContext";

interface ProgressBarProps {
  // Life progress mode
  birthDate?: Date;
  expectedLifespan?: number; // in years

  // Countdown progress mode
  startDate?: Date;
  targetDate?: Date;

  progressLabel?: string;
  showPercentage?: boolean;
  allowProgressBeyond100?: boolean; // Allow progress > 100% for life countdowns
}

export function ProgressBar({
  birthDate,
  expectedLifespan = 80,
  startDate,
  targetDate,
  progressLabel,
  showPercentage = true,
  allowProgressBeyond100 = false
}: ProgressBarProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    let stopped = false;

    const calculateProgress = () => {
      const now = new Date();

      if (birthDate && expectedLifespan) {
        // Life progress mode: show percentage of life lived
        const ageInMilliseconds = now.getTime() - birthDate.getTime();
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
        const progressPercentage = (ageInYears / expectedLifespan) * 100;
        if (allowProgressBeyond100) {
          setProgress(Math.max(progressPercentage, 0));
        } else {
          setProgress(Math.min(Math.max(progressPercentage, 0), 100));
        }
      } else if (startDate && targetDate) {
        // Countdown progress mode: show progress toward the target date
        // Progress increases as we get closer to the event (0% = far away, 100% = event here)
        const total = targetDate.getTime() - startDate.getTime();
        const remaining = Math.max(0, targetDate.getTime() - now.getTime());

        // Progress = how much time we've "completed" toward the event
        // As remaining time decreases, progress increases
        const progressPercentage = Math.min(Math.max(((total - remaining) / total) * 100, 0), 100);
        setProgress(progressPercentage);
      } else if (targetDate) {
        // Fallback for countdowns without startDate: use reference period
        const remaining = Math.max(0, targetDate.getTime() - now.getTime());
        const referencePeriod = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
        const progressPercentage = Math.min(Math.max((1 - remaining / referencePeriod) * 100, 0), 100);
        setProgress(progressPercentage);
      }
    };

    const tick = () => {
      calculateProgress();

      // Drift correction: recalculate next second boundary
      if (!stopped) {
        const msToNextSecond = 1000 - (Date.now() % 1000);
        timeout = setTimeout(tick, msToNextSecond);
      }
    };

    // Initial update
    calculateProgress();

    // Calculate ms until next second boundary
    const msToNextSecond = 1000 - (Date.now() % 1000);
    timeout = setTimeout(tick, msToNextSecond);

    return () => {
      stopped = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [birthDate, expectedLifespan, startDate, targetDate]);

  const getDefaultLabel = () => {
    if (birthDate && expectedLifespan) {
      return t("events.lifeProgress");
    } else if (startDate && targetDate) {
      return t("common.progress");
    }
    return t("common.progress");
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{progressLabel || getDefaultLabel()}</span>
        {showPercentage && (
          <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

// Legacy export for backward compatibility
export const LifeProgressBar = ProgressBar; 