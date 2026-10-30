import { useI18n } from '@/hooks/useI18n';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('gu');
    else setLanguage('en');
  };

  const getLabel = () => {
    if (language === 'en') return 'English';
    if (language === 'hi') return 'हिन्दी';
    return 'ગુજરાતી';
  };

  const getNextLabel = () => {
    if (language === 'en') return 'Hindi';
    if (language === 'hi') return 'Gujarati';
    return 'English';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleLanguage}
      aria-label={`Language: ${getLabel()}. Click to switch to ${getNextLabel()}.`}
      title={`Current: ${getLabel()} (Click to switch)`}
    >
      <Globe className="h-4 w-4" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
