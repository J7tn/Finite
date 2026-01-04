import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Device } from '@capacitor/device';
import { TranslationProvider } from './contexts/TranslationContext';
import OnboardingFlow from './components/OnboardingFlow';
import MotivationalSplash from './components/MotivationalSplash';
import { SplashScreen } from '@capacitor/splash-screen';
import splashImg from './splash.png';
import { StatusBar, Style } from '@capacitor/status-bar';

// Lazy load components
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Settings = lazy(() => import('@/pages/Settings'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Error boundary component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-600 mb-4">Please try refreshing the page</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showMotivationalSplash, setShowMotivationalSplash] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('isMuted');
    return stored === 'true';
  });
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem('volume');
    let volumeValue = 0.25; // Default to 25%

    if (stored) {
      const storedValue = parseFloat(stored);
      // If user had old high volume (like 0.6, or 0.1), migrate to 25%
      if (storedValue > 0.25) {
        volumeValue = 0.25;
        localStorage.setItem('volume', '0.25');
      } else {
        volumeValue = storedValue;
      }
    } else {
      // No stored value, use default 25%
      localStorage.setItem('volume', '0.25');
    }

    return volumeValue;
  });

  const [countdownVolume, setCountdownVolume] = useState(() => {
    const stored = localStorage.getItem('countdownVolume');
    let volumeValue = 0.1; // Default to 10%

    if (stored) {
      const storedValue = parseFloat(stored);
      // Keep user's existing volume preference
      volumeValue = storedValue;
    } else {
      // No stored value, use default 10%
      localStorage.setItem('countdownVolume', '0.1');
    }

    return volumeValue;
  });
  const [onboardingCheckTrigger, setOnboardingCheckTrigger] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Splash fade logic
  useEffect(() => {
    if (showOnboarding !== null) {
      // Wait a bit, then fade out splash
      setTimeout(() => setSplashFade(true), 400); // Start fade after 400ms
    }
  }, [showOnboarding]);

  // Remove splash overlay after fade-out transition ends
  const handleSplashTransitionEnd = () => {
    if (splashFade) {
      setSplashVisible(false);
      SplashScreen.hide();
    }
  };

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const shouldShowOnboarding = hasSeenOnboarding !== 'true';

    if (shouldShowOnboarding) {
      setShowOnboarding(true);
      setShowMotivationalSplash(false);
    } else {
      setShowOnboarding(false);
      setShowMotivationalSplash(true); // Show motivational splash for returning users
    }
  }, [onboardingCheckTrigger]);

  // Initial onboarding check on mount
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const shouldShowOnboarding = hasSeenOnboarding !== 'true';

    if (shouldShowOnboarding) {
      setShowOnboarding(true);
      setShowMotivationalSplash(false);
    } else {
      setShowOnboarding(false);
      setShowMotivationalSplash(true);
    }
  }, []); // Empty dependency array - runs once on mount

  // Global function for resetting onboarding (used by settings)
  useEffect(() => {
    (window as any).resetOnboarding = () => {
      localStorage.removeItem('hasSeenOnboarding');
      localStorage.removeItem('showLifeCountdownEdit');
      setOnboardingCheckTrigger(prev => prev + 1);
    };
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('showLifeCountdownEdit', 'true'); // trigger edit dialog for new users
    setShowOnboarding(false);
    setShowMotivationalSplash(true); // Show motivational splash after onboarding
  };

  const handleMotivationalSplashComplete = () => {
    setShowMotivationalSplash(false);
  };

  // Start audio after first user gesture (required by browsers) - only if on home page
  useEffect(() => {
    const startAudio = () => {
      if (!audioStarted && audioRef.current && showOnboarding === false && showMotivationalSplash === false) {
        audioRef.current.volume = volume;
        audioRef.current.play().catch((error) => {
          console.warn('Audio playback failed:', error);
        });
        setAudioStarted(true);
      }
    };
    window.addEventListener('pointerdown', startAudio, { once: true });
    return () => window.removeEventListener('pointerdown', startAudio);
  }, [audioStarted, showOnboarding, showMotivationalSplash, volume]);

  // Set initial volume on audio element when it becomes available
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef.current, volume]);

  // Mute/unmute logic
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    localStorage.setItem('isMuted', isMuted ? 'true' : 'false');
  }, [isMuted]);

  // Music volume control logic
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    // Only save to localStorage if volume is different from default (25%)
    if (volume !== 0.25) {
      localStorage.setItem('volume', volume.toString());
    } else {
      localStorage.removeItem('volume'); // Remove stored value when at default
    }
  }, [volume]);

  // Countdown volume persistence
  useEffect(() => {
    // Only save to localStorage if volume is different from default (10%)
    if (countdownVolume !== 0.1) {
      localStorage.setItem('countdownVolume', countdownVolume.toString());
    } else {
      localStorage.removeItem('countdownVolume'); // Remove stored value when at default
    }
  }, [countdownVolume]);

  // Control audio playback based on current page
  useEffect(() => {
    if (audioRef.current) {
      const shouldPlayAudio = showOnboarding === false && showMotivationalSplash === false;

      if (shouldPlayAudio && !isMuted) {
        audioRef.current.volume = volume;
        audioRef.current.play().catch((error) => {
          console.warn('Audio playback failed:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [showOnboarding, showMotivationalSplash, isMuted, volume]);

  // Fade in audio volume from 0 to target volume over 2 seconds
  const fadeInAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0;
      const targetVolume = 0.25; // Always fade to 25%
      const duration = 2000; // ms
      const steps = 20;
      const stepTime = duration / steps;
      let currentStep = 0;
      const fade = () => {
        currentStep++;
        const newVolume = Math.min(targetVolume, (currentStep / steps) * targetVolume);
        audioRef.current!.volume = newVolume;
        if (currentStep < steps) {
          setTimeout(fade, stepTime);
        }
      };
      fade();
    }
  };

  // Global error handler
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error caught:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Show error fallback if there's an error
  if (hasError) {
    return <ErrorFallback error={new Error('Application error')} />;
  }

  // Show loading while determining app state
  if (showOnboarding === null) {
    return <LoadingFallback />;
  }

  return (
    <TranslationProvider>
      {/* Black status bar background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'env(safe-area-inset-top, 24px)',
        background: '#000',
        zIndex: 9999,
        pointerEvents: 'none',
      }} />

      {/* Onboarding overlay when needed - FULL SCREEN */}
      {showOnboarding && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10000,
          background: 'var(--background)'
        }}>
          <OnboardingFlow onComplete={handleOnboardingComplete} fadeInAudio={fadeInAudio} />
        </div>
      )}

      {/* Motivational splash overlay for returning users */}
      {showMotivationalSplash && !showOnboarding && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10000,
          background: 'var(--background)'
        }}>
          <MotivationalSplash onComplete={handleMotivationalSplashComplete} />
        </div>
      )}

      {/* Ambience audio (debug: visible, with error/play handlers) */}
      <audio
        ref={audioRef}
        src="/meditation-ambient-music-354473.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
        onError={(e) => console.error('Audio failed to load or play:', e)}
      />

      {/* Main app content - only show when neither onboarding nor motivational splash, and onboarding state is determined */}
      {showOnboarding === false && showMotivationalSplash === false && (
        <>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home isMuted={isMuted} setIsMuted={setIsMuted} volume={volume} setVolume={setVolume} countdownVolume={countdownVolume} setCountdownVolume={setCountdownVolume} />} />
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<Settings volume={volume} setVolume={setVolume} countdownVolume={countdownVolume} setCountdownVolume={setCountdownVolume} />} />
            </Routes>
          </Suspense>
          {splashVisible && (
            <div
              className={`splash-overlay${splashFade ? ' splash-fade-out' : ''}`}
              onTransitionEnd={handleSplashTransitionEnd}
            >
              <img
                src={splashImg}
                alt="Splash"
                style={{
                  maxWidth: '80vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 24,
                  boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
                }}
                onError={(e) => {
                  console.error('Splash image failed to load:', e);
                  setSplashVisible(false);
                }}
              />
            </div>
          )}
        </>
      )}
    </TranslationProvider>
  );
};

export default App;
