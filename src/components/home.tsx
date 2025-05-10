import React, { useState, useEffect } from "react";
import OnboardingFlow from "./OnboardingFlow";
import CountdownTimer from "./CountdownTimer";
import SettingsMenu from "./SettingsMenu";
import { Button } from "./ui/button";
import { Settings } from "lucide-react";

interface UserData {
  birthDate: Date | null;
  motto: string;
  isFirstTime: boolean;
}

const Home = () => {
  const [userData, setUserData] = useState<UserData>({
    birthDate: null,
    motto: "Make every second count",
    isFirstTime: true,
  });

  const [showSettings, setShowSettings] = useState(false);

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
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (userData.birthDate) {
      localStorage.setItem("lifeCountdownData", JSON.stringify(userData));
    }
  }, [userData]);

  const handleOnboardingComplete = (birthDate: Date, motto: string) => {
    setUserData({
      birthDate,
      motto,
      isFirstTime: false,
    });
  };

  const handleSettingsUpdate = (birthDate: Date, motto: string) => {
    setUserData({
      ...userData,
      birthDate,
      motto,
    });
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto relative">
        {userData.isFirstTime || !userData.birthDate ? (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        ) : (
          <>
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-white"
              >
                <Settings size={20} />
              </Button>
            </div>
            <CountdownTimer
              birthDate={userData.birthDate}
              motto={userData.motto}
            />
            {showSettings && (
              <SettingsMenu
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={handleSettingsUpdate}
                initialBirthDate={userData.birthDate}
                initialMotto={userData.motto}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
