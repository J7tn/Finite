import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

interface LifeProgressBarProps {
  birthDate: Date;
  expectedLifespan: number; // in years
  progressLabel?: string; // new prop for editable label
}

export function LifeProgressBar({ birthDate, expectedLifespan = 80, progressLabel = "Life Progress" }: LifeProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const ageInMilliseconds = now.getTime() - birthDate.getTime();
      const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
      const progressPercentage = (ageInYears / expectedLifespan) * 100;
      setProgress(Math.min(progressPercentage, 100));
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000); // Update every second

    return () => clearInterval(interval);
  }, [birthDate, expectedLifespan]);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{progressLabel}</span>
        <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
} 