import { Theme, THEMES } from '@/types/echowrite';
import { PremiumBadge } from './PremiumBadge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  isPremiumUser: boolean;
}

export const ThemeSelector = ({ currentTheme, onThemeChange, isPremiumUser }: ThemeSelectorProps) => {
  const handleThemeClick = (theme: typeof THEMES[0]) => {
    if (theme.isPremium && !isPremiumUser) {
      return; // Could show upgrade prompt
    }
    onThemeChange(theme.id);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Theme Selection
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => {
          const isSelected = currentTheme === theme.id;
          const isLocked = theme.isPremium && !isPremiumUser;

          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme)}
              disabled={isLocked}
              className={cn(
                'relative p-3 rounded-2xl text-left transition-all duration-300',
                isSelected 
                  ? 'neu-pressed ring-2 ring-primary' 
                  : 'neu-flat hover:scale-[1.02]',
                isLocked && 'opacity-60 cursor-not-allowed'
              )}
            >
              {/* Color Preview */}
              <div className="flex gap-1 mb-2">
                {theme.previewColors.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-border/50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Theme Name */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {theme.name}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary" />
                )}
                {theme.isPremium && !isSelected && (
                  <PremiumBadge variant="lock" />
                )}
              </div>

              {/* Description */}
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                {theme.description}
              </p>

              {/* Premium Overlay */}
              {isLocked && (
                <div className="absolute inset-0 rounded-2xl bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
                  <PremiumBadge tooltip={`Upgrade to unlock ${theme.name} theme`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
