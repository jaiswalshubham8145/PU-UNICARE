import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const icons = {
    dark: <Moon className="h-4 w-4" />,
    light: <Sun className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Theme: ${theme}. Click to cycle.`}
      title={`Current: ${theme}`}
      className="relative"
    >
      {icons[theme]}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
