import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Device } from '@capacitor/device';
import { measurePerformance } from '@/utils/performance';
import { initializeLanguage } from './services/translation';
import OnboardingFlow from './components/OnboardingFlow';

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

const App: React.FC = () => {
  const endMeasure = measurePerformance('App Initial Render');
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);

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

  // Show loading while language is being initialized
  if (!isLanguageInitialized) {
    return <LoadingFallback />;
  }

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
};

export default App;
