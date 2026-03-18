export enum WritingStyle {
  // 🧑‍💼 Professional & Work (Daily Use)
  PROFESSIONAL_EMAIL = 'Professional Email',
  FOLLOW_UP_MESSAGE = 'Follow-Up Message',
  RESUME_CV_OPTIMIZER = 'Resume/CV Optimizer',
  COVER_LETTER = 'Cover Letter',
  CLIENT_PROPOSAL = 'Client Proposal',
  
  // ⚖️ Legal & Formal
  LEGAL_DRAFT = 'Legal Draft',
  
  // 📈 Marketing & Sales
  MARKETING_COPY = 'Marketing Copy',
  SALES_PITCH = 'Sales Pitch',
  PRODUCT_DESCRIPTION = 'Product Description',
  LANDING_PAGE_COPY = 'Landing Page Copy',
  
  // ✍️ Content & Social
  CONTENT_WRITING = 'Content Writing',
  SOCIAL_MEDIA_POST = 'Social Media Post',
  VIDEO_REEL_SCRIPT = 'Video/Reel Script',
  
  // 🧠 Humanization & Clarity
  HUMANIZER = 'Humanizer',
  SIMPLIFY_LANGUAGE = 'Simplify Language',
  POLITE_RESPECTFUL = 'Polite & Respectful',
  
  // 🎓 Academic & Technical
  ACADEMIC_WRITING = 'Academic Writing',
  TECHNICAL_DOC = 'Technical Doc',
  
  // 🧑‍🤝‍🧑 Personal & High-Stress
  COMPLAINT_REQUEST = 'Complaint/Request Letter',
  NEGOTIATION_MESSAGE = 'Negotiation Message',

  // 💬 Casual & Everyday (NEW)
  CASUAL_MESSAGE = 'Casual Message',
  GRAMMAR_FIX = 'Grammar Fix',
  PHRASING_IMPROVE = 'Phrasing Improve',
  CREATIVE_WRITING = 'Creative Writing',
  SUMMARY = 'Summary',
  BULLET_POINTS = 'Bullet Points',
}

// Style categories for organized display
export interface StyleCategory {
  id: string;
  emoji: string;
  label: string;
  styles: WritingStyle[];
}

export const STYLE_CATEGORIES: StyleCategory[] = [
  {
    id: 'professional',
    emoji: '🧑‍💼',
    label: 'Professional & Work',
    styles: [
      WritingStyle.PROFESSIONAL_EMAIL,
      WritingStyle.FOLLOW_UP_MESSAGE,
      WritingStyle.RESUME_CV_OPTIMIZER,
      WritingStyle.COVER_LETTER,
      WritingStyle.CLIENT_PROPOSAL,
    ]
  },
  {
    id: 'legal',
    emoji: '⚖️',
    label: 'Legal & Formal',
    styles: [
      WritingStyle.LEGAL_DRAFT,
    ]
  },
  {
    id: 'marketing',
    emoji: '📈',
    label: 'Marketing & Sales',
    styles: [
      WritingStyle.MARKETING_COPY,
      WritingStyle.SALES_PITCH,
      WritingStyle.PRODUCT_DESCRIPTION,
      WritingStyle.LANDING_PAGE_COPY,
    ]
  },
  {
    id: 'content',
    emoji: '✍️',
    label: 'Content & Social',
    styles: [
      WritingStyle.CONTENT_WRITING,
      WritingStyle.SOCIAL_MEDIA_POST,
      WritingStyle.VIDEO_REEL_SCRIPT,
    ]
  },
  {
    id: 'humanization',
    emoji: '🧠',
    label: 'Humanization & Clarity',
    styles: [
      WritingStyle.HUMANIZER,
      WritingStyle.SIMPLIFY_LANGUAGE,
      WritingStyle.POLITE_RESPECTFUL,
    ]
  },
  {
    id: 'academic',
    emoji: '🎓',
    label: 'Academic & Technical',
    styles: [
      WritingStyle.ACADEMIC_WRITING,
      WritingStyle.TECHNICAL_DOC,
    ]
  },
  {
    id: 'personal',
    emoji: '🧑‍🤝‍🧑',
    label: 'Personal & High-Stress',
    styles: [
      WritingStyle.COMPLAINT_REQUEST,
      WritingStyle.NEGOTIATION_MESSAGE,
    ]
  },
  {
    id: 'casual',
    emoji: '💬',
    label: 'Casual & Everyday',
    styles: [
      WritingStyle.CASUAL_MESSAGE,
      WritingStyle.GRAMMAR_FIX,
      WritingStyle.PHRASING_IMPROVE,
      WritingStyle.CREATIVE_WRITING,
      WritingStyle.SUMMARY,
      WritingStyle.BULLET_POINTS,
    ]
  },
];

export type Theme = 
  | 'neumorphic-green'
  | 'golden-cream'
  | 'glassmorphism'
  | 'neo-brutalism'
  | 'skeuomorphism'
  | 'clay-morphism'
  | 'minimalism'
  | 'liquid-glass'
  | 'ocean-deep'
  | 'sunset-glow';

export interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  isPremium: boolean;
  previewColors: string[];
}

export const THEMES: ThemeOption[] = [
  { id: 'neumorphic-green', name: 'Soft Neumorphic', description: 'Elegant soft shadows with sage green tones', isPremium: false, previewColors: ['#c8d5c8', '#7a9e7a', '#e8ede8'] },
  { id: 'golden-cream', name: 'Golden Cream', description: 'Warm gold accents on creamy backgrounds', isPremium: false, previewColors: ['#f5f0e6', '#d4a843', '#fff'] },
  { id: 'glassmorphism', name: 'Glass Effect', description: 'Frosted glass with blue-purple gradients', isPremium: true, previewColors: ['#1a1f2e', '#5cb3e8', '#a855f7'] },
  { id: 'neo-brutalism', name: 'Neo Brutalism', description: 'Bold black borders, yellow accents', isPremium: true, previewColors: ['#fef9c3', '#000', '#eab308'] },
  { id: 'skeuomorphism', name: 'Skeuomorphic', description: 'Realistic textures and leather tones', isPremium: true, previewColors: ['#d9cfc2', '#8b6f47', '#f5f0e8'] },
  { id: 'clay-morphism', name: 'Clay Morphism', description: 'Soft clay-like 3D elements', isPremium: true, previewColors: ['#ece4e1', '#e87777', '#f5a855'] },
  { id: 'minimalism', name: 'Pure Minimal', description: 'Clean black and white simplicity', isPremium: false, previewColors: ['#fafafa', '#171717', '#e5e5e5'] },
  { id: 'liquid-glass', name: 'Liquid Glass', description: 'Fluid gradients on dark backgrounds', isPremium: true, previewColors: ['#0f1824', '#2dd4bf', '#a78bfa'] },
  { id: 'ocean-deep', name: 'Ocean Deep', description: 'Calming blue-teal color palette', isPremium: true, previewColors: ['#e0f2fe', '#0ea5e9', '#14b8a6'] },
  { id: 'sunset-glow', name: 'Sunset Glow', description: 'Warm orange and coral gradients', isPremium: true, previewColors: ['#fef3e8', '#f97316', '#facc15'] },
];

export type UserTier = 'free' | 'premium' | 'trial';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  usageCount?: number;
  maxUsage?: number;
}

export interface WritingVariation {
  id: string;
  label: string;
  suggestedText: string;
  tone: string;
  changes: { field: string; reason: string }[];
}

export interface FlaggedIssue {
  issue: string;
  suggestion: string;
  type: 'grammar' | 'clarity' | 'tone';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  style: WritingStyle;
  variations: WritingVariation[];
}

// AI Modes (Premium Features)
export type AIMode = 
  | 'summary'
  | 'action-items'
  | 'meeting-notes'
  | 'blog-draft'
  | 'confident'
  | 'polite'
  | 'assertive'
  | 'persuasive';

export type VocabularyLevel = 'simple' | 'business' | 'advanced';

export type Industry = 'tech' | 'finance' | 'healthcare' | 'education' | 'marketing';

export interface AIEnhancementOptions {
  mode: AIMode;
  vocabularyLevel: VocabularyLevel;
  industry?: Industry;
  useHeadings: boolean;
  useEmojis: 'off' | 'subtle' | 'expressive';
  sentenceLength: 'short' | 'medium' | 'detailed';
}

// 25+ Supported Languages with flags and native script
export const SUPPORTED_LANGUAGES = [
  // Major languages
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', native: 'English', displayNative: '[English]' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', native: 'English', displayNative: '[English]' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸', native: 'Español', displayNative: '[Español]' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷', native: 'Français', displayNative: '[Français]' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪', native: 'Deutsch', displayNative: '[Deutsch]' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹', native: 'Italiano', displayNative: '[Italiano]' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷', native: 'Português', displayNative: '[Português]' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹', native: 'Português', displayNative: '[Português]' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺', native: 'Русский', displayNative: '[Русский]' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', native: '简体中文', displayNative: '[简体中文]' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼', native: '繁體中文', displayNative: '[繁體中文]' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', native: '日本語', displayNative: '[日本語]' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷', native: '한국어', displayNative: '[한국어]' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦', native: 'العربية', displayNative: '[العربية]' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe', displayNative: '[Türkçe]' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱', native: 'Nederlands', displayNative: '[Nederlands]' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱', native: 'Polski', displayNative: '[Polski]' },
  { code: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳', native: 'Tiếng Việt', displayNative: '[Tiếng Việt]' },
  { code: 'th-TH', name: 'Thai', flag: '🇹🇭', native: 'ไทย', displayNative: '[ไทย]' },
  // Indian languages
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी', displayNative: '[हिन्दी]' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்', displayNative: '[தமிழ்]' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు', displayNative: '[తెలుగు]' },
  { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ', displayNative: '[ಕನ್ನಡ]' },
  { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം', displayNative: '[മലയാളം]' },
  { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳', native: 'मराठी', displayNative: '[मराठी]' },
  { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳', native: 'বাংলা', displayNative: '[বাংলা]' },
  { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી', displayNative: '[ગુજરાતી]' },
  { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ', displayNative: '[ਪੰਜਾਬੀ]' },
];

// Premium feature definitions
export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'customization' | 'privacy' | 'automation';
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  { id: 'advanced-noise', name: 'Advanced Noise Cancellation', description: 'Crystal clear transcription even in noisy places', category: 'ai' },
  { id: 'smart-formatting', name: 'Smart Formatting & Summaries', description: 'AI-powered auto-formatting and summaries', category: 'ai' },
  { id: 'unlimited-recordings', name: 'Unlimited Recordings', description: 'No limits on recording time or count', category: 'ai' },
  { id: 'export-formats', name: 'Export to PDF / DOCX', description: 'Professional document exports', category: 'ai' },
  { id: 'cloud-sync', name: 'Cloud Sync', description: 'Sync across all your devices', category: 'automation' },
  { id: 'ai-summaries', name: 'AI Summaries & Action Items', description: 'Automatic meeting notes and action items', category: 'ai' },
  { id: 'premium-themes', name: 'Premium Themes', description: 'Access all 10 beautiful themes', category: 'customization' },
  { id: 'e2e-encryption', name: 'End-to-End Encryption', description: 'Maximum security for your content', category: 'privacy' },
  { id: 'automation-rules', name: 'Automation Rules', description: 'Auto-export, auto-summarize, and more', category: 'automation' },
];
