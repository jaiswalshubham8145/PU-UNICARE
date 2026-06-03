import { useI18n } from '@/hooks/useI18n';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const cycleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleLanguage}
      aria-label={`Language: ${language === 'en' ? 'English' : 'हिन्दी'}. Click to switch.`}
      title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      <Globe className="h-4 w-4" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
