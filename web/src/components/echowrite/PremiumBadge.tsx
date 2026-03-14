import { Crown, Lock, Sparkles, Star, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  variant?: 'badge' | 'lock' | 'icon' | 'large';
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  activated?: boolean;
}

export const PremiumBadge = ({ 
  variant = 'badge', 
  tooltip = 'Premium feature - Upgrade to unlock',
  size = 'sm',
  activated = false
}: PremiumBadgeProps) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  const content = {
    badge: (
      <span className={cn(
        "premium-badge",
        activated ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
        activated && "animate-pulse-slow"
      )}>
        {activated ? <Check className={iconSize} /> : <Star className={iconSize} />}
        <span>{activated ? 'PRO ✓' : 'FREE TRIAL'}</span>
      </span>
    ),
    lock: (
      <Lock className={`${iconSize} text-gold opacity-70`} />
    ),
    icon: (
      <Sparkles className={`${iconSize} text-gold`} />
    ),
    large: (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider',
        activated ? 'gold-gradient text-primary-foreground shadow-md ring-1 ring-gold/40' : 'bg-muted text-muted-foreground',
        activated && 'animate-pulse-slow'
      )}>
        {activated ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
        <span>{activated ? 'PRO' : 'FREE TRIAL'}</span>
      </span>
    ),
  };

  // For activated premium, show large badge without tooltip
  if (activated && variant === 'large') {
    return content.large;
  }

  // For activated badge variant, show without tooltip
  if (activated && variant === 'badge') {
    return content.badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">{content[variant]}</span>
        </TooltipTrigger>
        <TooltipContent 
          className="neu-flat border-border text-sm"
          sideOffset={5}
        >
          <p className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" />
            {activated ? 'Premium member - All features unlocked!' : tooltip}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
