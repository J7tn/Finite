import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";

interface SettingsPageProps {
  onComplete: (age: number, motto: string) => void;
  initialAge?: number;
  initialMotto?: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onComplete,
  initialAge,
  initialMotto = "",
}) => {
  const [age, setAge] = useState<number | "">(initialAge || "");
  const [motto, setMotto] = useState(initialMotto);
  const [ageError, setAgeError] = useState("");

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseInt(e.target.value, 10);
    setAge(value);

    if (value === "") {
      setAgeError("Age is required");
    } else if (value < 0 || value > 100) {
      setAgeError("Age must be between 0 and 100");
    } else {
      setAgeError("");
    }
  };

  const handleSave = () => {
    if (age === "" || age < 0 || age > 100) {
      setAgeError("Please enter a valid age between 0 and 100");
      return;
    }

    // Calculate birth date based on age
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const birthDate = new Date(birthYear, today.getMonth(), today.getDate());

    onComplete(age, motto);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Set Your Life Countdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="space-y-2">
                <label htmlFor="age" className="block text-sm font-medium">
                  Your Age
                </label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  max={100}
                  value={age}
                  onChange={handleAgeChange}
                  className="w-full"
                  placeholder="Enter your age"
                />
                {ageError && (
                  <p className="text-destructive text-sm mt-1">{ageError}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="space-y-2">
                <label htmlFor="motto" className="block text-sm font-medium">
                  Your Personal Motto
                </label>
                <Textarea
                  id="motto"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full min-h-[100px]"
                  placeholder="Your personal motto (optional)"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  This will appear below your countdown as a personal reminder.
                </p>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full"
            >
              <Button
                onClick={handleSave}
                className="w-full"
                disabled={age === "" || ageError !== ""}
              >
                Save
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
