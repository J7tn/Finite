import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAudio } from '@/contexts/AudioContext';
import { DEFAULT_LIFE_EXPECTANCY } from '@/types';

interface ExpandableBlockProps {
  eventName?: string;
  motto?: string;
  targetDate: Date;
  eventType?: string;
  lifeExpectancy?: number;
  createdAt?: Date;
  isExpanded: boolean;
  onExpand: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  eventId?: string;
}

const ExpandableBlock: React.FC<ExpandableBlockProps> = ({
  eventName,
  motto,
  targetDate,
  eventType = 'custom',
  lifeExpectancy,
  createdAt,
  isExpanded,
  onExpand,
  onEdit,
  onDelete,
  eventId,
}) => {
  const { t } = useTranslation();
  const { isMuted, countdownVolume } = useAudio();

  const effectiveLifeExpectancy = lifeExpectancy ?? DEFAULT_LIFE_EXPECTANCY;

  let countdownTargetDate = targetDate;
  if (eventType === 'lifeCountdown' && targetDate instanceof Date) {
    countdownTargetDate = new Date(targetDate);
    countdownTargetDate.setFullYear(targetDate.getFullYear() + effectiveLifeExpectancy);
  }

  const isMainLifeCountdown = eventName === t('events.lifeCountdown');

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
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
              {isMainLifeCountdown ? (
                <CountdownTimer
                  birthDate={targetDate}
                  expectedLifespan={effectiveLifeExpectancy}
                  motto={motto}
                  eventType={eventType}
                  ticking={isExpanded}
                  muted={isMuted}
                  volume={countdownVolume}
                />
              ) : eventType === 'lifeCountdown' ? (
                <CountdownTimer
                  birthDate={targetDate}
                  targetDate={countdownTargetDate}
                  expectedLifespan={effectiveLifeExpectancy}
                  motto={motto}
                  eventType={eventType}
                  ticking={isExpanded}
                  showLifeExpectancyNote={false}
                  muted={isMuted}
                  volume={countdownVolume}
                />
              ) : (
                <CountdownTimer
                  targetDate={targetDate}
                  startDate={createdAt}
                  motto={motto}
                  eventName={eventName}
                  eventId={eventId || eventName}
                  eventType={eventType}
                  ticking={isExpanded}
                  muted={isMuted}
                  volume={countdownVolume}
                  progressLabel={t('common.progress')}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isExpanded && (
        <div className="flex justify-end gap-2 mt-4">
          {onDelete && (
            <Button variant="destructive" onClick={onDelete} className="flex-1">
              {t('common.delete')}
            </Button>
          )}
          <Button variant="outline" onClick={onEdit} className={onDelete ? "flex-1" : "w-full"}>
            {eventName ? t('events.editEvent') : t('events.editLifeCountdown')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExpandableBlock;
