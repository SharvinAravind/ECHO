import { WritingStyle, STYLE_CATEGORIES } from '@/types/echowrite';
import { Mail, MessageCircle, Scale, Sparkles, GraduationCap, Wrench, Briefcase, FileCheck, Target, Megaphone, ShoppingBag, Layout, PenTool, Video, Bot, Languages, Heart, AlertTriangle, Handshake, Share2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StyleButtonsPopoverProps {
  currentStyle: WritingStyle;
  onSelect: (style: WritingStyle) => void;
  isLoading: boolean;
}

// Icon mapping for each style
const styleIcons: Record<WritingStyle, React.ComponentType<{
  className?: string;
}>> = {
  [WritingStyle.PROFESSIONAL_EMAIL]: Mail,
  [WritingStyle.FOLLOW_UP_MESSAGE]: MessageCircle,
  [WritingStyle.RESUME_CV_OPTIMIZER]: FileCheck,
  [WritingStyle.COVER_LETTER]: Briefcase,
  [WritingStyle.CLIENT_PROPOSAL]: Target,
  [WritingStyle.LEGAL_DRAFT]: Scale,
  [WritingStyle.MARKETING_COPY]: Megaphone,
  [WritingStyle.SALES_PITCH]: Sparkles,
  [WritingStyle.PRODUCT_DESCRIPTION]: ShoppingBag,
  [WritingStyle.LANDING_PAGE_COPY]: Layout,
  [WritingStyle.CONTENT_WRITING]: PenTool,
  [WritingStyle.SOCIAL_MEDIA_POST]: Share2,
  [WritingStyle.VIDEO_REEL_SCRIPT]: Video,
  [WritingStyle.HUMANIZER]: Bot,
  [WritingStyle.SIMPLIFY_LANGUAGE]: Languages,
  [WritingStyle.POLITE_RESPECTFUL]: Heart,
  [WritingStyle.ACADEMIC_WRITING]: GraduationCap,
  [WritingStyle.TECHNICAL_DOC]: Wrench,
  [WritingStyle.COMPLAINT_REQUEST]: AlertTriangle,
  [WritingStyle.NEGOTIATION_MESSAGE]: Handshake,
  [WritingStyle.CASUAL_MESSAGE]: MessageCircle,
  [WritingStyle.GRAMMAR_FIX]: FileCheck,
  [WritingStyle.PHRASING_IMPROVE]: PenTool,
  [WritingStyle.CREATIVE_WRITING]: Sparkles,
  [WritingStyle.SUMMARY]: Layout,
  [WritingStyle.BULLET_POINTS]: Target
};

// Full labels for popover items
const styleLabels: Record<WritingStyle, string> = {
  [WritingStyle.PROFESSIONAL_EMAIL]: 'Professional Email',
  [WritingStyle.FOLLOW_UP_MESSAGE]: 'Follow-Up Message',
  [WritingStyle.RESUME_CV_OPTIMIZER]: 'Resume/CV Optimizer',
  [WritingStyle.COVER_LETTER]: 'Cover Letter',
  [WritingStyle.CLIENT_PROPOSAL]: 'Client Proposal',
  [WritingStyle.LEGAL_DRAFT]: 'Legal Draft',
  [WritingStyle.MARKETING_COPY]: 'Marketing Copy',
  [WritingStyle.SALES_PITCH]: 'Sales Pitch',
  [WritingStyle.PRODUCT_DESCRIPTION]: 'Product Description',
  [WritingStyle.LANDING_PAGE_COPY]: 'Landing Page Copy',
  [WritingStyle.CONTENT_WRITING]: 'Blog/Article',
  [WritingStyle.SOCIAL_MEDIA_POST]: 'Social Media Post',
  [WritingStyle.VIDEO_REEL_SCRIPT]: 'Video/Reel Script',
  [WritingStyle.HUMANIZER]: 'Humanizer',
  [WritingStyle.SIMPLIFY_LANGUAGE]: 'Simplify Language',
  [WritingStyle.POLITE_RESPECTFUL]: 'Polite & Respectful',
  [WritingStyle.ACADEMIC_WRITING]: 'Academic Writing',
  [WritingStyle.TECHNICAL_DOC]: 'Technical Documentation',
  [WritingStyle.COMPLAINT_REQUEST]: 'Complaint/Request Letter',
  [WritingStyle.NEGOTIATION_MESSAGE]: 'Negotiation Message',
  [WritingStyle.CASUAL_MESSAGE]: 'Casual Message',
  [WritingStyle.GRAMMAR_FIX]: 'Grammar Fix',
  [WritingStyle.PHRASING_IMPROVE]: 'Phrasing Improve',
  [WritingStyle.CREATIVE_WRITING]: 'Creative Writing',
  [WritingStyle.SUMMARY]: 'Summary',
  [WritingStyle.BULLET_POINTS]: 'Bullet Points'
};

// Style descriptions
const styleDescriptions: Record<WritingStyle, string> = {
  [WritingStyle.PROFESSIONAL_EMAIL]: 'Clear, polite, workplace-ready',
  [WritingStyle.FOLLOW_UP_MESSAGE]: 'Confident without being pushy',
  [WritingStyle.RESUME_CV_OPTIMIZER]: 'ATS-friendly, achievement-focused',
  [WritingStyle.COVER_LETTER]: 'Role-specific, persuasive',
  [WritingStyle.CLIENT_PROPOSAL]: 'Value-driven business proposals',
  [WritingStyle.LEGAL_DRAFT]: 'Formal legal tone',
  [WritingStyle.MARKETING_COPY]: 'Benefit-focused messaging',
  [WritingStyle.SALES_PITCH]: 'Short, confident, objection-aware',
  [WritingStyle.PRODUCT_DESCRIPTION]: 'Convert features to value',
  [WritingStyle.LANDING_PAGE_COPY]: 'Headline → subtext → CTA',
  [WritingStyle.CONTENT_WRITING]: 'Structured long-form content',
  [WritingStyle.SOCIAL_MEDIA_POST]: 'Platform-ready, engaging',
  [WritingStyle.VIDEO_REEL_SCRIPT]: 'Hook-based scripts',
  [WritingStyle.HUMANIZER]: 'Remove robotic AI tone',
  [WritingStyle.SIMPLIFY_LANGUAGE]: 'Plain English clarity',
  [WritingStyle.POLITE_RESPECTFUL]: 'Fix harsh messages',
  [WritingStyle.ACADEMIC_WRITING]: 'Formal, citation-ready',
  [WritingStyle.TECHNICAL_DOC]: 'Step-by-step explanations',
  [WritingStyle.COMPLAINT_REQUEST]: 'Firm but professional',
  [WritingStyle.NEGOTIATION_MESSAGE]: 'Salary, pricing negotiations',
  [WritingStyle.CASUAL_MESSAGE]: 'Friendly, informal tone',
  [WritingStyle.GRAMMAR_FIX]: 'Fix grammar & spelling errors',
  [WritingStyle.PHRASING_IMPROVE]: 'Better word choices',
  [WritingStyle.CREATIVE_WRITING]: 'Imaginative, engaging prose',
  [WritingStyle.SUMMARY]: 'Concise key points',
  [WritingStyle.BULLET_POINTS]: 'Organized bullet format'
};

// Mobile category labels
const mobileCategoryLabels: Record<string, string> = {
  professional: 'Profession',
  legal: 'Legal',
  marketing: 'Marketing',
  content: 'Content',
  humanization: 'Clarity',
  academic: 'Technical',
  personal: 'Personal',
  casual: 'Everyday',
};

// Shared style item renderer
const StyleItem = ({ styleId, currentStyle, isLoading, onSelect, sizeLabelClass, sizeDescClass }: {
  styleId: WritingStyle;
  currentStyle: WritingStyle;
  isLoading: boolean;
  onSelect: (s: WritingStyle) => void;
  sizeLabelClass: string;
  sizeDescClass: string;
}) => {
  const Icon = styleIcons[styleId];
  const isActive = currentStyle === styleId;
  return (
    <button
      key={styleId}
      disabled={isLoading}
      onClick={() => onSelect(styleId)}
      className={cn(
        'w-full flex items-start gap-2 p-2 rounded-lg text-left transition-all',
        isActive ? 'neu-pressed ring-1 ring-primary' : 'hover:bg-muted/50',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className={cn('w-6 h-6 rounded-md flex items-center justify-center shrink-0', isActive ? 'bg-primary text-primary-foreground' : 'neu-flat')}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(sizeLabelClass, 'font-semibold truncate', isActive ? 'text-primary' : 'text-foreground')}>
          {styleLabels[styleId]}
        </p>
        <p className={cn(sizeDescClass, 'text-muted-foreground line-clamp-1')}>
          {styleDescriptions[styleId]}
        </p>
      </div>
      {isActive && (
        <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center shrink-0">
          <svg className="w-2 h-2 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};

export const StyleButtonsPopover = ({
  currentStyle,
  onSelect,
  isLoading
}: StyleButtonsPopoverProps) => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleStyleSelect = (style: WritingStyle) => {
    onSelect(style);
    setOpenPopover(null);
  };

  const getCurrentCategoryLabel = () => {
    for (const category of STYLE_CATEGORIES) {
      if (category.styles.includes(currentStyle)) {
        return `${category.emoji} ${styleLabels[currentStyle]}`;
      }
    }
    return 'Select Style';
  };

  return (
    <div className="space-y-2">
      {/* Single conditional render — prevents duplicate Popover portals */}
      {isMobile ? (
        <div className="grid grid-cols-4 gap-1.5">
          {STYLE_CATEGORIES.map(category => {
            const isActiveCategory = category.styles.includes(currentStyle);
            return (
              <Popover key={category.id} open={openPopover === category.id} onOpenChange={open => setOpenPopover(open ? category.id : null)}>
                <PopoverTrigger asChild>
                  <button disabled={isLoading} className={cn("flex items-center justify-center gap-1 px-1.5 py-2 rounded-lg font-semibold transition-all text-[11px]", isActiveCategory ? 'style-chip-active' : 'neu-flat text-muted-foreground hover:text-foreground hover:scale-[1.02]', isLoading && 'opacity-50 cursor-not-allowed')}>
                    <span className="text-[11px]">{category.emoji}</span>
                    <span className="truncate">{mobileCategoryLabels[category.id] || category.label}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 neu-flat border-border shadow-xl z-[60]" align="start" sideOffset={4}>
                  <div className="p-2 border-b border-border/30">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{category.emoji}</span>
                      <h4 className="font-bold text-xs text-foreground">{category.label}</h4>
                    </div>
                  </div>
                  <div className="p-1 max-h-[200px] overflow-y-auto">
                    {category.styles.map(styleId => (
                      <StyleItem key={styleId} styleId={styleId} currentStyle={currentStyle} isLoading={isLoading} onSelect={handleStyleSelect} sizeLabelClass="text-[11px]" sizeDescClass="text-[9px]" />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {STYLE_CATEGORIES.map(category => {
            const isActiveCategory = category.styles.includes(currentStyle);
            return (
              <Popover key={category.id} open={openPopover === category.id} onOpenChange={open => setOpenPopover(open ? category.id : null)}>
                <PopoverTrigger asChild>
                  <button disabled={isLoading} className={cn("flex items-center gap-1 px-2 py-1.5 rounded-lg font-semibold transition-all text-xs", isActiveCategory ? 'style-chip-active' : 'neu-flat text-muted-foreground hover:text-foreground hover:scale-[1.02]', isLoading && 'opacity-50 cursor-not-allowed')}>
                    <span className="text-xs">{category.emoji}</span>
                    <span>{category.label}</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 neu-flat border-border shadow-xl z-[60]" align="start" sideOffset={4}>
                  <div className="p-2 border-b border-border/30">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{category.emoji}</span>
                      <h4 className="font-bold text-xs text-foreground">{category.label}</h4>
                    </div>
                  </div>
                  <div className="p-1 max-h-[200px] overflow-y-auto">
                    {category.styles.map(styleId => (
                      <StyleItem key={styleId} styleId={styleId} currentStyle={currentStyle} isLoading={isLoading} onSelect={handleStyleSelect} sizeLabelClass="text-[10px]" sizeDescClass="text-[8px]" />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      )}

      {/* Current selection indicator */}
      <div className="flex items-center rounded-md neu-pressed text-[11px] sm:text-[10px] gap-[4px] border-2 px-[4px] py-[4px]">
        <span className="text-muted-foreground">✨</span>
        <span className="font-semibold text-primary">{getCurrentCategoryLabel()}</span>
      </div>
    </div>
  );
};
