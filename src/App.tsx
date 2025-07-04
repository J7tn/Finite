import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Device } from '@capacitor/device';
import { measurePerformance } from '@/utils/performance';
import { initializeLanguage } from './services/translation';

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

  useEffect(() => {
    const setLanguage = async () => {
      try {
        const lang = await Device.getLanguageCode();
        const supportedLanguages = ['en', 'es'];
        const languageToSet = supportedLanguages.includes(lang.value) ? lang.value : 'en';
        await initializeLanguage(languageToSet);
      } catch (error) {
        console.error('Failed to get device language, defaulting to English.', error);
        await initializeLanguage('en');
      }
      endMeasure();
    };

    setLanguage();
  }, []);

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

export default React.memo(App);
