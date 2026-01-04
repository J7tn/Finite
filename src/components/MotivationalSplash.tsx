import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

// Motivational messages - default English messages (translation system issues)
const DEFAULT_MOTIVATIONAL_MESSAGES = [
  "Every moment is a gift. Make it count.",
  "Your time is precious. Use it wisely.",
  "Life is finite. Live it fully.",
  "Today is a page in your story. Write it well.",
  "The clock is ticking. What will you do with this moment?",
  "Embrace the present. Shape your future.",
  "Time flies. Make it meaningful.",
  "Your journey matters. Take the next step.",
  "Live with purpose. Love with passion.",
  "Every second counts. Make them extraordinary.",
  "Your time is your most valuable asset.",
  "Make today remarkable.",
  "Life is what you make it. Make it beautiful.",
  "Every day is a new opportunity.",
  "Cherish the time you have.",
  "The present moment is a gift.",
  "Live intentionally. Love deeply.",
  "Your story is still being written.",
  "Time is the fire in which we burn.",
  "Make your moments matter.",
  "Life is short. Live it boldly.",
  "Every sunrise is a reminder of new beginnings.",
  "Your time here is limited. Use it well.",
  "Create memories that last a lifetime.",
  "The future is created in the present.",
  "Live with gratitude. Act with purpose.",
  "Your time is irreplaceable.",
  "Make peace with your past. Live in the present.",
  "Every breath is a chance to begin again.",
  "Time is the wisest counselor of all.",
  "Live as if this is your last day.",
  "Your legacy is built one moment at a time.",
  "Embrace uncertainty. Live fully.",
  "The clock may tick, but your spirit soars.",
  "Make today your masterpiece.",
  "Life's beauty lies in its impermanence.",
  "Your time is a canvas. Paint it beautifully.",
  "Every moment holds infinite potential.",
  "Live with wonder. Act with courage.",
  "Your time is a gift to yourself and others.",
  "The present is where miracles happen.",
  "Live deliberately. Love completely.",
  "Your story deserves to be extraordinary.",
  "Time is precious. Spend it wisely.",
  "Every second is a chance to change your world.",
  "Live with intention. Die with satisfaction.",
  "Your time is the most valuable currency.",
  "Make the most of what you have.",
  "Life is a collection of moments. Make them count.",
  "Your time is limited. Your impact is not.",
  "Live boldly. Love fiercely. Time flies.",
  "Every moment is a new beginning.",
  "Your time shapes your eternity.",
  "Live with purpose. Leave with pride.",
  "Time is the ultimate equalizer.",
  "Make your moments unforgettable.",
  "Life is finite. Your impact can be infinite.",
  "Your time is a treasure. Spend it wisely.",
  "Every day is a gift. Unwrap it fully.",
  "Live with passion. Act with purpose.",
  "Your time is your true wealth.",
  "Make memories that outlast time.",
  "Life is a journey. Make it meaningful.",
  "Your time is the most precious gift you give.",
  "Live fully. Love deeply. Time waits for no one.",
  "Every moment is a chance to be extraordinary."
];

// Motivational messages - with safe translation fallback
const getMotivationalMessages = (t: (key: string) => any): string[] => {
  try {
    const translatedMessages = t("events.motivationalMessages");
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

  // Always return the safe default array
  return DEFAULT_MOTIVATIONAL_MESSAGES;
};

interface MotivationalSplashProps {
  onComplete: () => void;
}

const MotivationalSplash: React.FC<MotivationalSplashProps> = ({ onComplete }) => {
  const { t, language } = useTranslation();
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Adjust typing speed based on language characteristics
  const isCJKLanguage = ['ja', 'zh', 'ko'].includes(language);
  const baseTypingSpeed = language === 'ja' ? 70 : (isCJKLanguage ? 60 : 45); // Slower for Japanese due to long compound words

  // Use smaller font sizes and maximum space for CJK languages
  const fontSizeClass = isCJKLanguage ? 'text-lg md:text-xl lg:text-2xl' : 'text-xl md:text-2xl lg:text-3xl';
  const containerPadding = isCJKLanguage ? 'px-2' : 'px-6';
  const maxWidthClass = isCJKLanguage ? 'max-w-full' : 'max-w-6xl';

  // Smart message splitting for very long CJK messages
  const splitMessageSmartly = (message: string): string => {
    // Japanese needs much shorter messages due to long compound words
    const maxLength = language === 'ja' ? 80 : 120;

    if (!isCJKLanguage || message.length <= maxLength) {
      return message;
    }

    // Find good split points: after punctuation marks (prioritize Japanese punctuation)
    const japaneseSplitPoints = ['。', '！', '？', '；', '：', '、'];
    const generalSplitPoints = ['. ', '! ', '? ', '; ', ': ', '。', '！', '？', '；', '：', '、'];

    const splitPoints = language === 'ja' ? japaneseSplitPoints : generalSplitPoints;

    for (const splitPoint of splitPoints) {
      const splitIndex = message.indexOf(splitPoint);
      if (splitIndex > 30 && splitIndex < message.length - 15) {
        // Found a good split point - split after the punctuation
        const actualSplitIndex = splitIndex + splitPoint.length;
        return message.substring(0, actualSplitIndex);
      }
    }

    // For Japanese, split at mora-like boundaries or character count limits
    if (language === 'ja') {
      // Japanese often has long compound words, so split at around 60-70 characters
      const japaneseSplitPoint = Math.floor(message.length * 0.5);
      let splitIndex = japaneseSplitPoint;

      // Look for good character boundaries in Japanese
      for (let i = 0; i < 15; i++) {
        const checkIndex = japaneseSplitPoint + i;
        if (checkIndex < message.length) {
          const char = message[checkIndex];
          // Japanese punctuation and particles
          if (['。', '！', '？', '；', '：', '、', 'は', 'が', 'を', 'に', 'で', 'と'].includes(char)) {
            splitIndex = checkIndex + 1;
            break;
          }
        }
      }

      return message.substring(0, Math.min(splitIndex, 70)); // Hard limit at 70 chars for Japanese
    }

    // For other CJK languages, use character-based splitting
    const midPoint = Math.floor(message.length * 0.6);
    let splitIndex = midPoint;

    // Try to find a nearby punctuation
    for (let i = 0; i < 20; i++) {
      const checkIndex = midPoint + i;
      if (checkIndex < message.length) {
        const char = message[checkIndex];
        if (['。', '！', '？', '；', '：', '、', ' ', '.', '!', '?', ';', ':'].includes(char)) {
          splitIndex = checkIndex + 1;
          break;
        }
      }

      const checkIndexBack = midPoint - i;
      if (checkIndexBack > 0) {
        const char = message[checkIndexBack];
        if (['。', '！', '？', '；', '：', '、', ' ', '.', '!', '?', ';', ':'].includes(char)) {
          splitIndex = checkIndexBack + 1;
          break;
        }
      }
    }

    return message.substring(0, splitIndex);
  };

  // Get motivational messages - with safe fallback
  const motivationalMessages = React.useMemo(() => {
    return getMotivationalMessages(t);
  }, [t]);

  const [currentMessageIndex] = useState(() =>
    Math.floor(Math.random() * DEFAULT_MOTIVATIONAL_MESSAGES.length)
  );

  // Typewriter effect with smart word boundaries (or fade-in for CJK to prevent jumping)
  useEffect(() => {
    // Ensure index is valid for current messages array
    const safeIndex = Math.min(currentMessageIndex, motivationalMessages.length - 1);

    const fullMessage = motivationalMessages[safeIndex] || DEFAULT_MOTIVATIONAL_MESSAGES[0];

    // For very long messages, split into two parts for better display
    const shouldSplitMessage = fullMessage.length > 120 && isCJKLanguage;
    const message = shouldSplitMessage ? splitMessageSmartly(fullMessage) : fullMessage;

    // Use typewriter effect for CJK languages with slower speed to prevent jarring layout shifts

    // Standard typewriter effect for non-CJK languages
    let charIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const typeChar = () => {
      if (charIndex < message.length) {
        const currentText = message.slice(0, charIndex + 1);
        setDisplayText(currentText);
        charIndex++;

        // Check if we should pause at word boundaries
        const nextChar = message[charIndex];
        const isAtWordBoundary = nextChar && (nextChar === ' ' || nextChar === '。' || nextChar === '、' || nextChar === '！' || nextChar === '？' || nextChar === '；');
        const isNearEnd = charIndex > message.length * 0.8;

        // Adaptive typing speed with word boundary awareness
        let adaptiveDelay = baseTypingSpeed;
        if (charIndex < message.length * 0.1) {
          adaptiveDelay = baseTypingSpeed * 1.8; // Slower start
        } else if (charIndex < message.length * 0.3) {
          adaptiveDelay = baseTypingSpeed * 1.2; // Medium start
        } else if (isAtWordBoundary && !isNearEnd) {
          adaptiveDelay = baseTypingSpeed * 1.5; // Pause at word boundaries
        }

        timeoutId = setTimeout(typeChar, adaptiveDelay);
      } else {
        // Message complete - stop cursor blinking after a brief pause
        setTimeout(() => {
          setShowCursor(false);
          setIsAnimationComplete(true);
        }, 1500); // Longer pause for reading
      }
    };

    // Start typing after a brief delay
    const startDelay = setTimeout(typeChar, 600);

    // Cursor blinking effect - adaptive to typing speed
    const cursorBlinkInterval = baseTypingSpeed * 12; // Slower blinking
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkInterval);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
  }, [currentMessageIndex, motivationalMessages, baseTypingSpeed, isCJKLanguage]);

  // Handle screen tap/click
  const handleScreenTap = () => {
    onComplete();
  };

  return (
    <div
      className={`min-h-screen bg-background flex items-center justify-center cursor-pointer ${isCJKLanguage ? 'p-2' : 'p-4'}`}
      onClick={handleScreenTap}
    >
      <div className="text-center mx-auto" style={isCJKLanguage ? { width: '100%', maxWidth: '100%' } : {}}>
        {/* App logo/title area */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t("app.title")}
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Motivational message with typewriter effect */}
        <div className={`mb-8 w-full flex items-center justify-center ${containerPadding} ${
          language === 'ja' ? 'min-h-[16rem] md:min-h-[20rem] lg:min-h-[24rem]' : 'min-h-[12rem] md:min-h-[16rem] lg:min-h-[20rem]'
        }`}>
          <div className="w-full" style={{ width: '100%', maxWidth: isCJKLanguage ? '100%' : '72rem', margin: '0 auto' }}>
            <div
              className="relative flex items-center justify-center w-full"
              style={{
                minHeight: isCJKLanguage ? '10rem' : '8rem',
                position: 'relative',
                width: '100%'
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: 'translateZ(0)', // Force hardware acceleration
                  backfaceVisibility: 'hidden',
                  width: '100%',
                  padding: isCJKLanguage ? '0 8px' : '0'
                }}
              >
                <p
                  className={`${fontSizeClass} font-light text-foreground leading-relaxed text-center transition-opacity duration-1000 break-words hyphens-auto overflow-wrap-anywhere ${
                    isCJKLanguage ? 'tracking-wide' : ''
                  }`}
                  style={{
                    lineHeight: isCJKLanguage ? '1.7' : '1.5',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap',
                    width: isCJKLanguage ? '100%' : 'auto',
                    maxWidth: isCJKLanguage ? 'none' : '100%',
                    opacity: 1,
                    transform: 'translateZ(0)', // Force hardware acceleration
                    backfaceVisibility: 'hidden'
                  }}
                >
                  {displayText}
                  {showCursor && <span className="animate-pulse inline-block ml-1">|</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tap to continue hint */}
        <div className="text-sm text-muted-foreground opacity-60 animate-pulse">
          {t("onboarding.tapToContinue")}
        </div>
      </div>
    </div>
  );
};

export default MotivationalSplash;