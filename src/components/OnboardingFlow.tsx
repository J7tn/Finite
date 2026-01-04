import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { Clock, Heart, Target, Zap } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  fadeInAudio?: () => void;
}

// Onboarding messages are now loaded from translations

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, fadeInAudio }) => {
  const { t, language } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(0);
  const [showButton, setShowButton] = useState(false);

  // Use smaller font sizes and maximum space for CJK languages
  const isCJKLanguage = ['ja', 'ko', 'zh'].includes(language);
  const fontSizeClass = isCJKLanguage ? 'text-base md:text-lg lg:text-xl' : 'text-lg md:text-xl lg:text-2xl';
  const containerWidthClass = isCJKLanguage ? 'max-w-full' : 'max-w-4xl';
  const horizontalPadding = isCJKLanguage ? 'px-1' : 'px-4';
  const cardPadding = isCJKLanguage ? 'p-4 md:p-6 lg:p-8' : 'p-6 md:p-8 lg:p-10';

  // Get onboarding messages from translations - with safe fallback
  const getOnboardingMessages = (): string[] => {
    try {
      const translatedMessages = t("onboarding.messages");
      // Check if it's an array and has content
      if (Array.isArray(translatedMessages) && translatedMessages.length > 0) {
        // Double-check that all items are strings
        if (translatedMessages.every(msg => typeof msg === 'string')) {
          return translatedMessages;
        }
      }
    } catch (error) {
      // Fall through to default messages
    }

    // Default English messages
    return [
      'Life is finite and we should live each moment of our lives purposely.',
      'Sometimes we forget and stumble along the way.',
      'When you do, use this app as a reminder.'
    ];
  };

  const prologueSentences = getOnboardingMessages();

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className={`w-full ${containerWidthClass} mx-auto`}>
        <CardContent className={cardPadding}>
          <div className="space-y-8 md:space-y-10 text-center min-h-[70vh] md:min-h-[80vh] lg:min-h-[90vh] flex flex-col justify-center relative px-4 py-8">
            <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto">
              {prologueSentences.map((sentence, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: visibleCount > idx ? 1 : 0 }}
                  transition={{ duration: 1.5 }}
                  className="w-full mb-6"
                >
                  <p
                    className={`${fontSizeClass} italic text-foreground leading-relaxed text-center break-words hyphens-auto overflow-wrap-anywhere ${isCJKLanguage ? 'px-0' : horizontalPadding}`}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      maxWidth: '100%',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {sentence}
                  </p>
                </motion.div>
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
                    <Button onClick={onComplete} variant="default" className="px-8 py-2 text-lg bg-gray-800 text-white hover:bg-gray-700">
                      {t("onboarding.begin")}
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
