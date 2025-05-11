import React, { useState, useEffect } from "react";
import CountdownTimer from "./CountdownTimer";
import SettingsPage from "./SettingsPage";
import SettingsMenu from "./SettingsMenu";
import { Button } from "./ui/button";
import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

interface UserData {
  age: number;
  birthDate: Date | null;
  motto: string;
  isFirstTime: boolean;
}

const Home = () => {
  const [userData, setUserData] = useState<UserData>({
    age: 0,
    birthDate: null,
    motto: "Make every second count",
    isFirstTime: true,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("lifeCountdownData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setUserData({
        ...parsedData,
        birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : null,
        isFirstTime: false,
      });
    }
    setLoading(false);
    SplashScreen.hide();

    // Check system preference for dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);

    // Prevent status bar from overlaying the app content
    if ((window as any).Capacitor) {
      StatusBar.setOverlaysWebView({ overlay: false });
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (userData.birthDate) {
      localStorage.setItem("lifeCountdownData", JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    // Set status bar style and color based on dark mode (inverted logic)
    if ((window as any).Capacitor) {
      if (isDarkMode) {
        StatusBar.setStyle({ style: Style.Dark }); // black icons
        StatusBar.setBackgroundColor({ color: '#ffffff' }); // white background
      } else {
        StatusBar.setStyle({ style: Style.Light }); // white icons
        StatusBar.setBackgroundColor({ color: '#000000' }); // black background
      }
    }
  }, [isDarkMode]);

  const handleSettingsComplete = (age: number, motto: string) => {
    // Calculate birth date based on age
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const birthDate = new Date(birthYear, today.getMonth(), today.getDate());

    setUserData({
      ...userData,
      age,
      birthDate,
      motto,
      isFirstTime: false,
    });
  };

  const handleSettingsUpdate = (settings: { birthDate: Date; motto: string }) => {
    // Calculate age from birthDate
    const today = new Date();
    const age = today.getFullYear() - settings.birthDate.getFullYear();

    setUserData({
      ...userData,
      age,
      birthDate: settings.birthDate,
      motto: settings.motto,
    });
    setShowSettings(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode class to document
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (loading) return <div className="w-screen h-screen bg-background" />;

  return (
    <div
      className={`w-screen h-screen ${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      } flex items-center justify-center`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {userData.isFirstTime || !userData.birthDate ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SettingsPage
                onComplete={handleSettingsComplete}
                initialAge={userData.age}
                initialMotto={userData.motto}
              />
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              <div className={`absolute top-12 right-4 flex space-x-2 z-10`}>
                <Button
                  onClick={toggleDarkMode}
                  className="text-gray-400 hover:text-white"
                >
                  {isDarkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  )}
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Settings size={20} />
                </Button>
              </div>

              <CountdownTimer
                birthDate={userData.birthDate}
                motto={userData.motto}
                age={userData.age}
              />

              {showSettings && (
                <SettingsMenu
                  open={showSettings}
                  onOpenChange={setShowSettings}
                  birthDate={userData.birthDate}
                  motto={userData.motto}
                  onSave={handleSettingsUpdate}
                  isDarkMode={isDarkMode}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
