import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsPageProps {
  onComplete: (age: number, motto: string) => void;
  initialAge?: number;
  initialMotto?: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onComplete,
  initialAge = 25,
  initialMotto = "Make every second count",
}) => {
  const [age, setAge] = useState<number>(initialAge);
  const [motto, setMotto] = useState<string>(initialMotto);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(age, motto);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-background rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Life Countdown</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="age">Your Age</Label>
          <Input
            id="age"
            type="number"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value))}
            className="w-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motto">Personal Motto</Label>
          <Input
            id="motto"
            type="text"
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            className="w-full"
            placeholder="Enter your personal motto"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Start Countdown
        </Button>
      </form>
    </div>
  );
};

export default SettingsPage;
