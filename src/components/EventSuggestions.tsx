import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { t } from "@/services/translation";
import { Lightbulb, X } from "lucide-react";

interface EventSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  onDismiss: () => void;
  isVisible: boolean;
}

const EventSuggestions: React.FC<EventSuggestionsProps> = ({
  onSuggestionClick,
  onDismiss,
  isVisible
}) => {
  const suggestions = [
    { key: 'spouseBirthday', text: t('events.suggestions.spouseBirthday') },
    { key: 'spouseAnniversary', text: t('events.suggestions.spouseAnniversary') },
    { key: 'specialDay', text: t('events.suggestions.specialDay') },
    { key: 'vacation', text: t('events.suggestions.vacation') },
    { key: 'retirement', text: t('events.suggestions.retirement') },
    { key: 'graduation', text: t('events.suggestions.graduation') },
    { key: 'milestone', text: t('events.suggestions.milestone') },
    { key: 'holiday', text: t('events.suggestions.holiday') }
  ];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                {t('events.suggestions.title')}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            {t('events.suggestions.subtitle')}
          </p>
          
          <div className="space-y-2">
            {suggestions.slice(0, 4).map((suggestion) => (
              <Button
                key={suggestion.key}
                variant="ghost"
                size="sm"
                onClick={() => onSuggestionClick(suggestion.text)}
                className="w-full justify-start text-left text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 h-auto p-2"
              >
                {suggestion.text}
              </Button>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('events.suggestions.dismiss')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventSuggestions; 