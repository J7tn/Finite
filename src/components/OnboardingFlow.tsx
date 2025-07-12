import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/services/translation';
import { Clock, Heart, Target, Zap } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="space-y-8 text-center">
            <p className="text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed">
              Life is finite and we should live each moment of our lives purposely. Sometimes we forget and stumble along the way. When you do, use this app as a reminder.
            </p>
            <Button onClick={onComplete} className="mt-8 px-8 py-2 text-lg">
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
