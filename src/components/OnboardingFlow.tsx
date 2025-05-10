import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ArrowRight } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (birthDate: Date, motto: string) => void;
  isFirstTimeUser?: boolean;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  isFirstTimeUser = true,
}) => {
  const [step, setStep] = useState<number>(1);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [motto, setMotto] = useState<string>("");

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleComplete = () => {
    if (birthDate) {
      onComplete(birthDate, motto);
    }
  };

  if (!isFirstTimeUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background p-4 justify-center items-center">
      <Card className="w-full max-w-md mx-auto bg-card">
        {step === 1 && (
          <>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">Our time is finite.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNext}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">
                When were you born?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="birthdate">Your birth date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="birthdate"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? (
                        format(birthDate, "PPP")
                      ) : (
                        <span>Select your birth date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  We'll use this to calculate your remaining time based on the
                  global average life expectancy.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleNext}
                disabled={!birthDate}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">
                Add a personal motto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="motto">Your personal reminder (optional)</Label>
                <Textarea
                  id="motto"
                  placeholder="e.g., Make every second count"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  This will appear below your countdown as a personal reminder.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" onClick={handleComplete}>
                Complete Setup
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleComplete}
              >
                Skip
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default OnboardingFlow;
