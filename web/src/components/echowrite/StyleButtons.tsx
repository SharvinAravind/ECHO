import { WritingStyle, STYLE_CATEGORIES } from '@/types/echowrite';
import { 
  Mail, 
  MessageCircle, 
  Scale, 
  Sparkles, 
  GraduationCap, 
  Palette, 
  FileText, 
  Share2, 
  Wrench, 
  List,
  Briefcase,
  FileCheck,
  Target,
  Megaphone,
  ShoppingBag,
  Layout,
  PenTool,
  Video,
  Bot,
  Languages,
  Heart,
  AlertTriangle,
  Handshake
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StyleButtonsProps {
  currentStyle: WritingStyle;
  onSelect: (style: WritingStyle) => void;
  isLoading: boolean;
}

// Icon mapping for each style
const styleIcons: Record<WritingStyle, React.ComponentType<{ className?: string }>> = {
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
  // New styles
  [WritingStyle.CASUAL_MESSAGE]: MessageCircle,
  [WritingStyle.GRAMMAR_FIX]: FileCheck,
  [WritingStyle.PHRASING_IMPROVE]: PenTool,
  [WritingStyle.CREATIVE_WRITING]: Sparkles,
  [WritingStyle.SUMMARY]: List,
  [WritingStyle.BULLET_POINTS]: List,
};

// Short labels for chips
const styleLabels: Record<WritingStyle, string> = {
  [WritingStyle.PROFESSIONAL_EMAIL]: 'Prof. Email',
  [WritingStyle.FOLLOW_UP_MESSAGE]: 'Follow-Up',
  [WritingStyle.RESUME_CV_OPTIMIZER]: 'Resume/CV',
  [WritingStyle.COVER_LETTER]: 'Cover Letter',
  [WritingStyle.CLIENT_PROPOSAL]: 'Proposal',
  [WritingStyle.LEGAL_DRAFT]: 'Legal',
  [WritingStyle.MARKETING_COPY]: 'Marketing',
  [WritingStyle.SALES_PITCH]: 'Sales Pitch',
  [WritingStyle.PRODUCT_DESCRIPTION]: 'Product Desc',
  [WritingStyle.LANDING_PAGE_COPY]: 'Landing Page',
  [WritingStyle.CONTENT_WRITING]: 'Blog/Article',
  [WritingStyle.SOCIAL_MEDIA_POST]: 'Social',
  [WritingStyle.VIDEO_REEL_SCRIPT]: 'Video Script',
  [WritingStyle.HUMANIZER]: 'Humanizer',
  [WritingStyle.SIMPLIFY_LANGUAGE]: 'Simplify',
  [WritingStyle.POLITE_RESPECTFUL]: 'Polite',
  [WritingStyle.ACADEMIC_WRITING]: 'Academic',
  [WritingStyle.TECHNICAL_DOC]: 'Tech Doc',
  [WritingStyle.COMPLAINT_REQUEST]: 'Complaint',
  [WritingStyle.NEGOTIATION_MESSAGE]: 'Negotiation',
  // New styles
  [WritingStyle.CASUAL_MESSAGE]: 'Casual',
  [WritingStyle.GRAMMAR_FIX]: 'Grammar',
  [WritingStyle.PHRASING_IMPROVE]: 'Phrasing',
  [WritingStyle.CREATIVE_WRITING]: 'Creative',
  [WritingStyle.SUMMARY]: 'Summary',
  [WritingStyle.BULLET_POINTS]: 'Bullets',
};

export const StyleButtons = ({ currentStyle, onSelect, isLoading }: StyleButtonsProps) => {
  return (
    <div className="space-y-4">
      {STYLE_CATEGORIES.map((category) => (
        <div key={category.id} className="space-y-2">
          {/* Category Header */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-sm">{category.emoji}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {category.label}
            </span>
          </div>
          
          {/* Category Styles */}
          <div className="flex flex-wrap items-center gap-2">
            {category.styles.map((styleId) => {
              const Icon = styleIcons[styleId];
              const isActive = currentStyle === styleId;
              
              return (
                <button
                  key={styleId}
                  disabled={isLoading}
                  onClick={() => onSelect(styleId)}
                  className={cn(
                    'style-chip flex items-center gap-2',
                    isActive ? 'style-chip-active' : 'style-chip-inactive',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{styleLabels[styleId]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
