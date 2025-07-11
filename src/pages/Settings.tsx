import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, X, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setLanguage, getCurrentLanguage } from '@/services/translation';
import { t } from '@/services/translation';

type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'pt' | 'it';

const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  it: 'Italiano'
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getCurrentLanguage() as Language);

  const handleLanguageChange = (value: Language) => {
    setSelectedLanguage(value);
  };

  const handleSave = () => {
    setLanguage(selectedLanguage);
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    navigate('/');
    window.location.reload(); // Force reload to show onboarding
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mt-2" style={{ marginTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}>{t('settings.title')}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.language')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languageNames).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleResetOnboarding}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Onboarding
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Show the introduction flow again (for testing)
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {t('settings.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 