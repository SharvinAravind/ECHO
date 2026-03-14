import { User, Theme, THEMES } from '@/types/echowrite';
import { 
  User as UserIcon, 
  Crown, 
  LogOut,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumBadge } from './PremiumBadge';

interface ProfileMenuProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUpgrade: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}


export const ProfileMenu = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onUpgrade,
  currentTheme,
  onThemeChange
}: ProfileMenuProps) => {
  if (!isOpen) return null;

  const handleThemeClick = (theme: typeof THEMES[0]) => {
    if (theme.isPremium && user.tier !== 'premium') {
      return;
    }
    onThemeChange(theme.id);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute right-0 mt-2 w-80 rounded-3xl neu-flat z-50 overflow-hidden animate-scale-in">
        {/* User Info */}
        <div className="p-5 border-b border-border/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground truncate">{user.name}</p>
                {user.tier === 'premium' && (
                  <span className="premium-badge">
                    <Crown className="w-3 h-3" />
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {/* Usage Stats for Free Users */}
          {user.tier === 'free' && (
            <div className="mt-4 p-3 rounded-2xl neu-pressed">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Daily Usage
                </span>
                <span className="text-xs font-bold text-primary">
                  {user.usageCount || 0}/{user.maxUsage || 10}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((user.usageCount || 0) / (user.maxUsage || 10)) * 100}%`,
                    background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Theme Selection */}
        <div className="p-5 border-b border-border/30">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Theme Selection
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto scrollbar-hide">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              const isLocked = theme.isPremium && user.tier !== 'premium';

              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeClick(theme)}
                  disabled={isLocked}
                  className={cn(
                    'relative p-2.5 rounded-xl text-left transition-all duration-200',
                    isSelected 
                      ? 'neu-pressed ring-2 ring-primary' 
                      : 'neu-flat hover:scale-[1.02]',
                    isLocked && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Color Preview */}
                  <div className="flex gap-1 mb-1.5">
                    {theme.previewColors.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-border/30"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Theme Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-foreground truncate">
                      {theme.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    )}
                    {theme.isPremium && !isSelected && (
                      <PremiumBadge variant="lock" size="sm" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-3">
          {user.tier === 'free' && (
            <button 
              onClick={onUpgrade}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl gold-gradient text-white font-bold text-sm mb-2 hover:shadow-premium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Premium
            </button>
          )}
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl neu-button text-muted-foreground hover:text-destructive text-xs font-semibold mt-1"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};
