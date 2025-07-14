import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/services/translation';
import { Clock, Heart, Target, Zap } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  fadeInAudio?: () => void;
}

const prologueSentences = [
  'Life is finite and we should live each moment of our lives purposely.',
  'Sometimes we forget and stumble along the way.',
  'When you do, use this app as a reminder.'
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, fadeInAudio }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (fadeInAudio) fadeInAudio();
  }, [fadeInAudio]);

  useEffect(() => {
    if (visibleCount < prologueSentences.length) {
      const delay = visibleCount === 0 ? 0 : 2000;
      const timer = setTimeout(() => setVisibleCount(visibleCount + 1), delay);
      return () => clearTimeout(timer);
    } else {
      const btnTimer = setTimeout(() => setShowButton(true), 2000);
      return () => clearTimeout(btnTimer);
    }
  }, [visibleCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="space-y-8 text-center h-[60vh] flex flex-col justify-center relative">
            <div className="flex flex-col items-center justify-center h-full w-full">
              {prologueSentences.map((sentence, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: visibleCount > idx ? 1 : 0 }}
                  transition={{ duration: 1.5 }}
                  className="text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed mb-2 min-h-[2.5rem]"
                  style={{ minHeight: '2.5rem' }}
                >
                  {sentence}
                </motion.p>
              ))}
            </div>
            {/* Button placeholder always present, button absolutely positioned when visible */}
            <div style={{ position: 'relative', height: '72px', marginTop: '2rem', width: '100%' }}>
              <AnimatePresence>
                {showButton && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 3.0 }}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center' }}
                  >
                    <Button onClick={onComplete} variant="default" className="px-8 py-2 text-lg bg-white text-black">
                      Begin
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
