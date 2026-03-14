import { forwardRef, useImperativeHandle, useRef } from 'react';
import { WritingStyle, WritingVariation } from '@/types/echowrite';
import { StyleButtonsPopover } from './StyleButtonsPopover';
import { VariationOutput } from './VariationOutput';
import { LengthVariationsPanel, LengthVariationsPanelRef } from './LengthVariationsPanel';
import { Zap, Trash2, Sparkles, Ruler } from 'lucide-react';
import { toast } from 'sonner';

interface AIContentGeneratorProps {
  currentStyle: WritingStyle;
  onSelectStyle: (style: WritingStyle) => void;
  variations: WritingVariation[];
  selectedVariation: WritingVariation | null;
  onSelectVariation: (v: WritingVariation) => void;
  onApplyToWorkspace: (text: string) => void;
  isLoading: boolean;
  workspaceText?: string;
  onClear?: () => void;
}

export interface AIContentGeneratorRef {
  generateLengthVariations: () => Promise<void>;
}

export const AIContentGenerator = forwardRef<AIContentGeneratorRef, AIContentGeneratorProps>(({
  currentStyle,
  onSelectStyle,
  variations,
  selectedVariation,
  onSelectVariation,
  onApplyToWorkspace,
  isLoading,
  workspaceText = '',
  onClear
}, ref) => {
  const lengthVariationsRef = useRef<LengthVariationsPanelRef>(null);

  // Expose generate method for parent to call
  useImperativeHandle(ref, () => ({
    generateLengthVariations: async () => {
      if (lengthVariationsRef.current) {
        await lengthVariationsRef.current.generate();
      }
    }
  }));

  const handleClear = () => {
    if (onClear) {
      onClear();
      toast.success('Workspace cleared!');
    }
  };

  return (
    <div className="neu-flat rounded-2xl sm:rounded-3xl p-4 sm:p-6">
      {/* Header with Clear Button - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl neu-convex flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] sm:text-sm font-bold text-foreground">⚡ AI-Powered Content Generation</h3>
            <p className="text-[10px] sm:text-[10px] text-muted-foreground">25 writing styles + length variations • Powered by AI</p>
          </div>
        </div>
        
        {/* Clear Button */}
        {onClear && (
          <button 
            onClick={handleClear} 
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl neu-button text-destructive hover:bg-destructive/10 transition-colors self-end sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase">Clear All</span>
          </button>
        )}
      </div>

      {/* Single Column Layout: Style Variations then Length Variations */}
      <div className="space-y-4 sm:space-y-6">
        {/* Style Variation Output - with emoji and icon */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <h4 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Style Variations Output
            </h4>
          </div>
          <VariationOutput 
            variations={variations} 
            selectedVariation={selectedVariation} 
            onSelectVariation={onSelectVariation} 
            onApplyToWorkspace={onApplyToWorkspace} 
            isLoading={isLoading} 
          />
        </div>

        {/* Length Variations Panel with Slider - Below Style Variations */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Ruler className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <h4 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Length Variations — Simple | Medium | Long
            </h4>
          </div>
          <LengthVariationsPanel 
            ref={lengthVariationsRef}
            text={workspaceText}
            onApplyToWorkspace={onApplyToWorkspace} 
          />
        </div>
      </div>
    </div>
  );
});

AIContentGenerator.displayName = 'AIContentGenerator';