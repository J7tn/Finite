import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TranslationProvider } from './contexts/TranslationContext';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import OnboardingFlow from './components/OnboardingFlow';
import MotivationalSplash from './components/MotivationalSplash';
import { SplashScreen } from '@capacitor/splash-screen';
import splashImg from './splash.png';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Settings = lazy(() => import('@/pages/Settings'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const AppContent: React.FC = () => {
  const { isMuted, volume } = useAudio();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showMotivationalSplash, setShowMotivationalSplash] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    if (showOnboarding !== null) {
      setTimeout(() => setSplashFade(true), 400);
    }
  }, [showOnboarding]);

  const handleSplashTransitionEnd = () => {
    if (splashFade) {
      setSplashVisible(false);
      SplashScreen.hide();
    }
  };

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding !== 'true') {
      setShowOnboarding(true);
      setShowMotivationalSplash(false);
    } else {
      setShowOnboarding(false);
      setShowMotivationalSplash(true);
    }
  }, []);

  if (import.meta.env.DEV) {
    (window as any).resetOnboarding = () => {
      localStorage.removeItem('hasSeenOnboarding');
      localStorage.removeItem('showLifeCountdownEdit');
      window.location.reload();
    };
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('showLifeCountdownEdit', 'true');
    setShowOnboarding(false);
    setShowMotivationalSplash(true);
  };

  const handleMotivationalSplashComplete = () => {
    setShowMotivationalSplash(false);
  };

  useEffect(() => {
    const startAudio = () => {
      if (!audioStarted && audioRef.current && showOnboarding === false && showMotivationalSplash === false) {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
        setAudioStarted(true);
      }
    };
    window.addEventListener('pointerdown', startAudio, { once: true });
    return () => window.removeEventListener('pointerdown', startAudio);
  }, [audioStarted, showOnboarding, showMotivationalSplash, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      const shouldPlay = showOnboarding === false && showMotivationalSplash === false;
      if (shouldPlay && !isMuted) {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [showOnboarding, showMotivationalSplash, isMuted, volume]);

  const fadeInAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0;
      const targetVolume = 0.25;
      const steps = 20;
      const stepTime = 100;
      let currentStep = 0;
      const fade = () => {
        currentStep++;
        audioRef.current!.volume = Math.min(targetVolume, (currentStep / steps) * targetVolume);
        if (currentStep < steps) setTimeout(fade, stepTime);
      };
      fade();
    }
  };

  if (showOnboarding === null) {
    return <LoadingFallback />;
  }

  return (
    <>
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

      <audio
        ref={audioRef}
        src="/meditation-ambient-music-354473.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />

      {showOnboarding === false && showMotivationalSplash === false && (
        <>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<Settings />} />
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
                onError={() => setSplashVisible(false)}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <TranslationProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </TranslationProvider>
    </ErrorBoundary>
  );
};

declare global {
  interface Window {
    resetOnboarding?: () => void;
  }
}

export default App;
