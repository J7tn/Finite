import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/contexts/TranslationContext";

interface LifeProgressBarProps {
  birthDate: Date;
  expectedLifespan: number; // in years
  progressLabel?: string; // new prop for editable label
}

export function LifeProgressBar({ birthDate, expectedLifespan = 80, progressLabel }: LifeProgressBarProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    let stopped = false;

    const calculateProgress = () => {
      const now = new Date();
      const ageInMilliseconds = now.getTime() - birthDate.getTime();
      const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
      const progressPercentage = (ageInYears / expectedLifespan) * 100;
      setProgress(Math.min(progressPercentage, 100));
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
  }, [birthDate, expectedLifespan]);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{progressLabel || t("events.lifeProgress")}</span>
        <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
} 