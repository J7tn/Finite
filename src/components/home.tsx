import React, { useState, useEffect } from "react";
import CountdownTimer from "./CountdownTimer";
import SettingsPage from "./SettingsPage";
import SettingsMenu from "./SettingsMenu";
import ExpandableBlock from "./ExpandableBlock";
import EventForm from "./EventForm";
import { Button } from "./ui/button";
import { Settings, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "./ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "./ui/alert-dialog";

interface UserData {
  age: number;
  birthDate: Date | null;
  motto: string;
  isFirstTime: boolean;
  events: Event[];
}

interface Event {
  id: string;
  name: string;
  date: Date;
  motto: string;
  createdAt: number;
}

const Home = () => {
  const [userData, setUserData] = useState<UserData>({
    age: 0,
    birthDate: null,
    motto: "Make every second count",
    isFirstTime: true,
    events: [],
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? stored === "true" : false;
  });
  const [loading, setLoading] = useState(true);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("lifeCountdownData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setUserData({
        ...parsedData,
        birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : null,
        isFirstTime: false,
        events: Array.isArray(parsedData.events) ? parsedData.events : [],
      });
    }
    setLoading(false);
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (userData.birthDate) {
      localStorage.setItem("lifeCountdownData", JSON.stringify(userData));
    }
  }, [userData]);

  // On mount, apply dark mode class if needed
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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

  const handleSettingsUpdate = (settings: {
    birthDate: Date;
    motto: string;
  }) => {
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
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("darkMode", newValue.toString());
      // Apply dark mode class to document
      if (newValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newValue;
    });
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

              {/* Scrollable blocks area */}
              <div className="w-full max-w-md flex flex-col items-center overflow-y-auto" style={{ maxHeight: '80vh' }}>
                <ExpandableBlock
                  birthDate={userData.birthDate}
                  motto={userData.motto}
                  age={userData.age}
                  events={userData.events}
                  isExpanded={expandedBlockId === 'main'}
                  onExpand={() => setExpandedBlockId(expandedBlockId === 'main' ? null : 'main')}
                />
                {userData.events.map((event) => (
                  <ExpandableBlock
                    key={event.id}
                    birthDate={undefined}
                    motto={event.motto}
                    age={undefined}
                    events={[]}
                    eventName={event.name}
                    targetDate={new Date(event.date)}
                    createdAt={event.createdAt}
                    isExpanded={expandedBlockId === event.id}
                    onExpand={() => setExpandedBlockId(expandedBlockId === event.id ? null : event.id)}
                    onEdit={() => setEditingEvent(event)}
                  />
                ))}
              </div>

              {/* Add New Event button always visible below the event blocks */}
              <div className="flex justify-center mt-4 w-full max-w-md mx-auto">
                <Button
                  onClick={() => setShowEventForm(!showEventForm)}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  Add New Event
                </Button>
              </div>

              <AnimatePresence>
                {showEventForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-md mx-auto mt-4"
                  >
                    <div className="bg-card rounded-lg shadow-lg">
                      <div className="p-4 border-b border-border">
                        <h3 className="text-lg font-semibold">Add New Event</h3>
                      </div>
                      <EventForm
                        onSubmit={(eventData) => {
                          const newEvent = {
                            ...eventData,
                            id: Date.now().toString(),
                            createdAt: Date.now(),
                          };
                          setUserData({
                            ...userData,
                            events: [...(userData.events || []), newEvent],
                          });
                          setShowEventForm(false);
                        }}
                        onCancel={() => setShowEventForm(false)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

              {/* Edit Event Modal */}
              <Dialog open={!!editingEvent} onOpenChange={(open) => { if (!open) setEditingEvent(null); }}>
                <DialogContent>
                  {editingEvent && (
                    <EventForm
                      initialName={editingEvent.name}
                      initialDate={new Date(editingEvent.date)}
                      initialMotto={editingEvent.motto}
                      onSubmit={(updated) => {
                        setUserData({
                          ...userData,
                          events: userData.events.map(ev =>
                            ev.id === editingEvent.id ? { ...ev, ...updated, createdAt: ev.createdAt } : ev
                          ),
                        });
                        setEditingEvent(null);
                      }}
                      onCancel={() => setEditingEvent(null)}
                      onDelete={() => setShowDeleteConfirm(true)}
                    />
                  )}
                </DialogContent>
              </Dialog>

              {/* Delete Confirmation Dialog */}
              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Do you want to delete this event?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <button type="button">No</button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <button type="button" onClick={() => {
                        if (editingEvent) {
                          setUserData({
                            ...userData,
                            events: userData.events.filter(ev => ev.id !== editingEvent.id),
                          });
                          setEditingEvent(null);
                        }
                        setShowDeleteConfirm(false);
                      }}>
                        Yes
                      </button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
