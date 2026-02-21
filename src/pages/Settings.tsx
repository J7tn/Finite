import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, ChevronDown, ChevronUp, Volume2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAudio } from '@/contexts/AudioContext';

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
  const { language, setLanguage, t } = useTranslation();
  const { volume, setVolume, countdownVolume, setCountdownVolume } = useAudio();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const isCJKLanguage = ['ja', 'ko', 'zh'].includes(language);
  const textSizeClass = isCJKLanguage ? 'text-xs' : 'text-sm';
  const titleSizeClass = isCJKLanguage ? 'text-sm' : 'text-base';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mt-2" style={{ marginTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}>{t('settings.title')}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.language')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={(v: string) => setLanguage(v as Language)}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languageNames).map(([code, name]) => (
                  <SelectItem key={code} value={code}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              {t('settings.audioVolume')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('settings.volumeLevel')}</span>
                <span className="text-sm font-medium">{Math.round(volume * 100)}%</span>
              </div>
              <Slider value={[volume]} onValueChange={(value) => setVolume(value[0])} max={1} min={0} step={0.01} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              {t('settings.countdownVolume')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('settings.countdownVolumeLevel')}</span>
                <span className="text-sm font-medium">{Math.round(countdownVolume * 100)}%</span>
              </div>
              <Slider value={[countdownVolume]} onValueChange={(value) => setCountdownVolume(value[0])} max={1} min={0} step={0.01} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="cursor-pointer" onClick={() => setShowSuggestions((prev) => !prev)}>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className={titleSizeClass}>{t("settings.needSuggestions")}</CardTitle>
              {showSuggestions ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </CardHeader>
            {showSuggestions && (
              <CardContent>
                <div className={`mt-1 space-y-2 ${textSizeClass}`}>
                  <p className={`${textSizeClass} font-medium text-muted-foreground mb-3`}>{t("events.suggestions.subtitle")}</p>
                  <ul className="space-y-2">
                    <li className={textSizeClass}>{t("events.suggestions.spouseBirthday")}</li>
                    <li className={textSizeClass}>{t("events.suggestions.spouseAnniversary")}</li>
                    <li className={textSizeClass}>{t("events.suggestions.specialDay")}</li>
                    <li className={textSizeClass}>{t("events.suggestions.vacation")}</li>
                    <li className={textSizeClass}>{t("events.suggestions.retirement")}</li>
                    <li className={textSizeClass}>{t("events.suggestions.graduation")}</li>
                    <li className={textSizeClass}>{t("events.suggestions.milestone")}</li>
                    <li className={textSizeClass}>{t("events.suggestions.holiday")}</li>
                  </ul>
                </div>
              </CardContent>
            )}
          </div>
        </Card>

        <Card>
          <div className="cursor-pointer" onClick={() => setShowContact((prev) => !prev)}>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-base">{t("settings.contact")}</CardTitle>
              {showContact ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </CardHeader>
            {showContact && (
              <CardContent>
                <p className="mt-1 text-sm">
                  {t("settings.contactDescription")} <a href="mailto:jntnnn4@gmail.com" className="underline text-blue-600">jntnnn4@gmail.com</a>
                </p>
              </CardContent>
            )}
          </div>
        </Card>

        {import.meta.env.DEV && (
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600 dark:text-orange-400">Development Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Testing and development utilities.</p>
                <Button
                  variant="outline"
                  onClick={() => window.resetOnboarding?.()}
                  className="w-full flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Onboarding Flow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={() => navigate('/')} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
