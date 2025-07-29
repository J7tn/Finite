import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Device } from '@capacitor/device';
import { measurePerformance } from '@/utils/performance';
import { initializeLanguage } from './services/translation';
import OnboardingFlow from './components/OnboardingFlow';
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
  const endMeasure = measurePerformance('App Initial Render');
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('isMuted');
    return stored === 'true';
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const setLanguage = async () => {
      try {
        const lang = await Device.getLanguageCode();
        console.log('Device language detected:', lang.value);
        
        const supportedLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'it'];
        const languageToSet = supportedLanguages.includes(lang.value) ? lang.value : 'en';
        console.log('Setting language to:', languageToSet);
        
        await initializeLanguage(languageToSet);
        console.log('Language initialization complete');
        setIsLanguageInitialized(true);
      } catch (error) {
        console.error('Failed to get device language, trying browser language.', error);
        try {
          // Fallback to browser language
          const browserLang = navigator.language.split('-')[0];
          console.log('Browser language detected:', browserLang);
          
          const supportedLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'it'];
          const languageToSet = supportedLanguages.includes(browserLang) ? browserLang : 'en';
          console.log('Setting language to (fallback):', languageToSet);
          
          await initializeLanguage(languageToSet);
          console.log('Language initialization complete (fallback)');
          setIsLanguageInitialized(true);
        } catch (fallbackError) {
          console.error('Failed to get browser language, defaulting to English.', fallbackError);
          await initializeLanguage('en');
          setIsLanguageInitialized(true);
        }
      }
      endMeasure();
    };

    setLanguage();
  }, []);

  // Splash fade logic
  useEffect(() => {
    if (isLanguageInitialized && showOnboarding !== null) {
      // Wait a bit, then fade out splash
      setTimeout(() => setSplashFade(true), 400); // Start fade after 400ms
    }
  }, [isLanguageInitialized, showOnboarding]);

  // Remove splash overlay after fade-out transition ends
  const handleSplashTransitionEnd = () => {
    if (splashFade) {
      setSplashVisible(false);
      SplashScreen.hide();
    }
  };

  useEffect(() => {
    if (isLanguageInitialized) {
      // Check if user has seen onboarding before
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      setShowOnboarding(hasSeenOnboarding !== 'true');
    }
  }, [isLanguageInitialized]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('showLifeCountdownEdit', 'true'); // trigger edit dialog for new users
    setShowOnboarding(false);
  };

  // Start audio after first user gesture (required by browsers)
  useEffect(() => {
    const startAudio = () => {
      if (!audioStarted && audioRef.current) {
        audioRef.current.volume = 0.6;
        audioRef.current.play().catch((error) => {
          console.warn('Audio playback failed:', error);
        });
        setAudioStarted(true);
      }
    };
    window.addEventListener('pointerdown', startAudio, { once: true });
    return () => window.removeEventListener('pointerdown', startAudio);
  }, [audioStarted]);

  // Mute/unmute logic
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    localStorage.setItem('isMuted', isMuted ? 'true' : 'false');
  }, [isMuted]);

  // Fade in audio volume from 0 to 0.6 over 2 seconds
  const fadeInAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0;
      const targetVolume = 0.6;
      const duration = 2000; // ms
      const steps = 20;
      const stepTime = duration / steps;
      let currentStep = 0;
      const fade = () => {
        currentStep++;
        audioRef.current!.volume = Math.min(targetVolume, (currentStep / steps) * targetVolume);
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

  // Show loading while language is being initialized
  if (!isLanguageInitialized) {
    return <LoadingFallback />;
  }

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} fadeInAudio={fadeInAudio} />;
  }

  return (
    <>
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
      {/* Ambience audio (debug: visible, with error/play handlers) */}
      <audio
        ref={audioRef}
        src="/meditation-ambient-music-354473.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
        onError={(e) => console.error('Audio failed to load or play:', e)}
        onPlay={() => console.log('Audio playback started')}
      />
      {/* Main app content */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home isMuted={isMuted} setIsMuted={setIsMuted} />} />
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
            onError={(e) => {
              console.error('Splash image failed to load:', e);
              setSplashVisible(false);
            }}
          />
        </div>
      )}
    </>
  );
};

export default App;
