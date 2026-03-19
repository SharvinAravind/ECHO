import { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  User, 
  Mic, 
  FileText, 
  Sparkles, 
  Download, 
  CirclePlay, 
  Database, 
  Palette, 
  Shield, 
  Zap, 
  CreditCard,
  ChevronDown,
  ChevronRight,
  Crown,
  Lock,
  Check,
  Info,
  LogOut,
  Save,
  ZoomIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User as UserType, Theme, THEMES } from '@/types/echowrite';
import { Switch } from '@/components/ui/switch';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onUpgrade?: () => void;
  onUnsubscribe?: () => void;
  onManageSubscription?: () => void;
  onLogout?: () => void;
}

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingsSection = ({ title, icon, children, defaultOpen = false }: SettingsSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl neu-convex flex items-center justify-center">
            {icon}
          </div>
          <span className="font-semibold text-foreground text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-5 pb-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

interface SettingRowProps {
  label: string;
  description?: string;
  isPremium?: boolean;
  premiumTooltip?: string;
  isLocked?: boolean;
  children: React.ReactNode;
}

const SettingRow = ({ 
  label, 
  description, 
  isPremium = false, 
  premiumTooltip = "Upgrade to Premium to unlock",
  isLocked = false,
  children 
}: SettingRowProps) => {
  // When isPremium feature but NOT locked = user has premium and feature is unlocked
  const isUnlockedPremium = isPremium && !isLocked;
  
  return (
    <div className={cn(
      "flex items-center justify-between py-3 px-4 rounded-2xl transition-all",
      isLocked ? "neu-pressed opacity-60" : "neu-flat hover:scale-[1.01]",
      isUnlockedPremium && "ring-1 ring-accent/30"
    )}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            isLocked ? "text-muted-foreground" : "text-foreground"
          )}>
            {label}
          </span>
          {isPremium && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase",
                    isUnlockedPremium 
                      ? "gold-gradient text-primary-foreground shadow-sm" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isUnlockedPremium ? (
                      <>
                        <Check className="w-2.5 h-2.5" />
                        PRO
                      </>
                    ) : (
                      <>
                        <Crown className="w-2.5 h-2.5" />
                        PRO
                      </>
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="neu-flat border-border text-xs max-w-[200px]">
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-accent" />
                    {isUnlockedPremium ? "Premium feature unlocked!" : premiumTooltip}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isLocked && (
            <Lock className="w-3 h-3 text-accent/70 animate-pulse" />
          )}
        </div>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className={cn(isLocked && "pointer-events-none")}>
        {children}
      </div>
    </div>
  );
};

export const SettingsPanel = ({
  isOpen,
  onClose,
  user,
  currentTheme,
  onThemeChange,
  onUpgrade,
  onUnsubscribe,
  onManageSubscription,
  onLogout
}: SettingsPanelProps) => {
  const isPremium = user.tier === 'premium';

  // Load saved settings from localStorage
  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem('echowrite-settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };

  const savedSettings = loadSavedSettings();
  
  // Local state for settings - initialized from localStorage
  const [noiseReduction, setNoiseReduction] = useState(savedSettings?.noiseReduction ?? true);
  const [advancedNoiseCancellation, setAdvancedNoiseCancellation] = useState(savedSettings?.advancedNoiseCancellation ?? false);
  const [micCalibration, setMicCalibration] = useState(savedSettings?.micCalibration ?? false);
  const [realTimePunctuation, setRealTimePunctuation] = useState(savedSettings?.realTimePunctuation ?? false);
  const [speakerDiarization, setSpeakerDiarization] = useState(savedSettings?.speakerDiarization ?? false);
  const [accentOptimization, setAccentOptimization] = useState(savedSettings?.accentOptimization ?? false);
  const [autoLanguageDetection, setAutoLanguageDetection] = useState(savedSettings?.autoLanguageDetection ?? false);
  const [smartFormatting, setSmartFormatting] = useState(savedSettings?.smartFormatting ?? false);
  const [autoGrammar, setAutoGrammar] = useState(savedSettings?.autoGrammar ?? false);
  const [timestamps, setTimestamps] = useState(savedSettings?.timestamps ?? false);
  const [emojis, setEmojis] = useState(savedSettings?.emojis ?? false);
  const [bulletPoints, setBulletPoints] = useState(savedSettings?.bulletPoints ?? false);
  const [unlimitedRecording, setUnlimitedRecording] = useState(savedSettings?.unlimitedRecording ?? false);
  const [backgroundRecording, setBackgroundRecording] = useState(savedSettings?.backgroundRecording ?? false);
  const [autoPauseOnSilence, setAutoPauseOnSilence] = useState(savedSettings?.autoPauseOnSilence ?? false);
  const [bookmarkMoments, setBookmarkMoments] = useState(savedSettings?.bookmarkMoments ?? false);
  const [waveformVisualization, setWaveformVisualization] = useState(savedSettings?.waveformVisualization ?? true);
  const [cloudSync, setCloudSync] = useState(savedSettings?.cloudSync ?? false);
  const [searchableHistory, setSearchableHistory] = useState(savedSettings?.searchableHistory ?? false);
  const [e2eEncryption, setE2eEncryption] = useState(savedSettings?.e2eEncryption ?? false);
  const [autoDelete, setAutoDelete] = useState(savedSettings?.autoDelete ?? false);
  const [localOnlyProcessing, setLocalOnlyProcessing] = useState(savedSettings?.localOnlyProcessing ?? false);
  const [noAiTraining, setNoAiTraining] = useState(savedSettings?.noAiTraining ?? false);
  const [autoSummarize, setAutoSummarize] = useState(savedSettings?.autoSummarize ?? false);
  const [autoExport, setAutoExport] = useState(savedSettings?.autoExport ?? false);
  const [autoRename, setAutoRename] = useState(savedSettings?.autoRename ?? false);
  const [aiArtGeneration, setAiArtGeneration] = useState(savedSettings?.aiArtGeneration ?? false);
  const [zoomLevel, setZoomLevel] = useState<string>(savedSettings?.zoomLevel ?? '100');
  const [fontFamily, setFontFamily] = useState<string>(savedSettings?.fontFamily ?? 'system');
  const [isSaved, setIsSaved] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  
  // Master toggle for all pro features
  const [allProEnabled, setAllProEnabled] = useState(savedSettings?.allProEnabled ?? false);

  // Track changes to mark as dirty
  useEffect(() => {
    setIsDirty(true);
    setIsSaved(false);
  }, [noiseReduction, advancedNoiseCancellation, micCalibration, realTimePunctuation,
      speakerDiarization, accentOptimization, autoLanguageDetection, smartFormatting,
      autoGrammar, timestamps, emojis, bulletPoints, unlimitedRecording, backgroundRecording,
      autoPauseOnSilence, bookmarkMoments, waveformVisualization, cloudSync, searchableHistory,
      e2eEncryption, localOnlyProcessing, noAiTraining, autoSummarize, autoExport, autoRename,
      aiArtGeneration, zoomLevel, fontFamily, allProEnabled]);

  // Apply zoom level
  useEffect(() => {
    document.documentElement.style.zoom = `${parseInt(zoomLevel)}%`;
    return () => { document.documentElement.style.zoom = ''; };
  }, [zoomLevel]);

  // Apply font family
  useEffect(() => {
    const fontMap: Record<string, string> = {
      system: 'system-ui, sans-serif',
      inter: '"Inter", sans-serif',
      roboto: '"Roboto", sans-serif',
      poppins: '"Poppins", sans-serif',
      opensans: '"Open Sans", sans-serif',
      lato: '"Lato", sans-serif',
      montserrat: '"Montserrat", sans-serif',
      nunito: '"Nunito", sans-serif',
      raleway: '"Raleway", sans-serif',
      playfair: '"Playfair Display", serif',
      merriweather: '"Merriweather", serif',
      georgia: 'Georgia, serif',
      courier: '"Courier New", monospace',
      firacode: '"Fira Code", monospace',
      jetbrains: '"JetBrains Mono", monospace',
    };
    document.documentElement.style.fontFamily = fontMap[fontFamily] || fontMap.system;
    return () => { document.documentElement.style.fontFamily = ''; };
  }, [fontFamily]);

  const handleSaveSettings = () => {
    const settings = {
      noiseReduction, advancedNoiseCancellation, micCalibration, realTimePunctuation,
      speakerDiarization, accentOptimization, autoLanguageDetection, smartFormatting,
      autoGrammar, timestamps, emojis, bulletPoints, unlimitedRecording, backgroundRecording,
      autoPauseOnSilence, bookmarkMoments, waveformVisualization, cloudSync, searchableHistory,
      e2eEncryption, localOnlyProcessing, noAiTraining, autoSummarize, autoExport, autoRename,
      aiArtGeneration, zoomLevel, fontFamily, allProEnabled
    };
    localStorage.setItem('echowrite-settings', JSON.stringify(settings));
    setIsSaved(true);
    setIsDirty(false);
  };
  
  // Enable all pro features at once
  const handleEnableAllPro = (enabled: boolean) => {
    if (!isPremium) return;
    setAllProEnabled(enabled);
    if (enabled) {
      setAdvancedNoiseCancellation(true);
      setMicCalibration(true);
      setRealTimePunctuation(true);
      setSpeakerDiarization(true);
      setAccentOptimization(true);
      setAutoLanguageDetection(true);
      setSmartFormatting(true);
      setAutoGrammar(true);
      setTimestamps(true);
      setEmojis(true);
      setBulletPoints(true);
      setUnlimitedRecording(true);
      setBackgroundRecording(true);
      setAutoPauseOnSilence(true);
      setBookmarkMoments(true);
      setCloudSync(true);
      setSearchableHistory(true);
      setE2eEncryption(true);
      setLocalOnlyProcessing(true);
      setNoAiTraining(true);
      setAutoSummarize(true);
      setAutoExport(true);
      setAutoRename(true);
      setAiArtGeneration(true);
    }
  };

  return (
    <>
      {/* Backdrop - Fixed and full coverage */}
      <div 
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-200',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      
      {/* Panel - Responsive */}
      <div className={cn(
        'fixed right-0 top-0 h-full w-full sm:max-w-lg bg-card z-[70] overflow-hidden flex flex-col transition-transform duration-300 ease-out shadow-2xl',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-card to-muted/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl neu-convex flex items-center justify-center">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Settings</h2>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                Configure your experience
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSettings}
              disabled={isSaved}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                isSaved 
                  ? "neu-flat text-primary opacity-70 cursor-default" 
                  : "primary-button hover:scale-[1.02]"
              )}
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl neu-button text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Quick Enable All Pro Features - Only for premium users */}
          {isPremium && (
            <div className="p-5 border-b border-border/30 bg-gradient-to-r from-accent/10 to-primary/10">
              <SettingRow 
                label="Enable All Pro Features" 
                description="One-click to activate all premium features. You can customize individually below."
                isPremium 
                isLocked={false}
              >
                <Switch 
                  checked={allProEnabled} 
                  onCheckedChange={handleEnableAllPro} 
                />
              </SettingRow>
            </div>
          )}
          {/* Account & Profile */}
          <SettingsSection 
            title="Account & Profile" 
            icon={<User className="w-4 h-4 text-primary" />}
            defaultOpen={true}
          >
            <SettingRow label="Name">
              <span className="text-sm text-muted-foreground">{user.name}</span>
            </SettingRow>
            <SettingRow label="Email">
              <span className="text-sm text-muted-foreground truncate max-w-[150px]">{user.email}</span>
            </SettingRow>
            <SettingRow label="Change Password">
              <button className="text-xs font-semibold text-primary hover:underline">
                Update
              </button>
            </SettingRow>
            
            {/* Subscription Section */}
            <SettingRow 
              label="Subscription Status"
              description={isPremium ? "Active" : "Free Plan"}
            >
              <span className={cn(
                "text-xs font-bold px-3 py-1 rounded-full",
                isPremium ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {isPremium ? "Premium" : "Free"}
              </span>
            </SettingRow>
            
            {isPremium ? (
              <>
                <SettingRow label="Manage Subscription">
                  <div className="flex gap-2">
                    <button 
                      onClick={onManageSubscription}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Manage
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button 
                      onClick={onUnsubscribe}
                      className="text-xs font-semibold text-destructive hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </SettingRow>
              </>
            ) : (
              <SettingRow label="Upgrade to Premium">
                <button 
                  onClick={onUpgrade}
                  className="text-xs font-semibold px-4 py-2 rounded-xl gold-gradient text-white"
                >
                  Upgrade
                </button>
              </SettingRow>
            )}
            
            {/* Premium Features */}
            <SettingRow 
              label="Multiple Profiles" 
              description="Switch between Work & Personal"
              isPremium 
              premiumTooltip="Create separate profiles for different contexts"
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[120px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Personal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Cloud Profile Sync" 
              description="Sync settings across devices"
              isPremium 
              premiumTooltip="Keep your preferences in sync everywhere"
              isLocked={!isPremium}
            >
              <Switch checked={cloudSync} onCheckedChange={setCloudSync} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Usage Analytics" 
              description="Track your productivity"
              isPremium 
              premiumTooltip="See detailed stats about your usage"
              isLocked={!isPremium}
            >
              <button className="text-xs font-semibold text-primary hover:underline" disabled={!isPremium}>
                View
              </button>
            </SettingRow>
          </SettingsSection>

          {/* Voice Input Settings */}
          <SettingsSection 
            title="Voice Input" 
            icon={<Mic className="w-4 h-4 text-primary" />}
          >
            <SettingRow label="Default Microphone">
              <Select>
                <SelectTrigger className="w-[150px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="System Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">System Default</SelectItem>
                  <SelectItem value="external">External Mic</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Basic Noise Reduction">
              <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
            </SettingRow>
            <SettingRow label="Transcription Speed">
              <Select>
                <SelectTrigger className="w-[120px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Normal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            
            {/* Premium Voice Features */}
            <SettingRow 
              label="Advanced AI Noise Cancellation" 
              description="Crystal-clear transcription in noisy places"
              isPremium 
              premiumTooltip="AI-powered noise removal for perfect clarity"
              isLocked={!isPremium}
            >
              <Switch checked={advancedNoiseCancellation} onCheckedChange={setAdvancedNoiseCancellation} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Microphone Calibration" 
              description="Optimize for your specific microphone"
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={micCalibration} onCheckedChange={setMicCalibration} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Real-time Punctuation" 
              description="Auto-add punctuation as you speak"
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={realTimePunctuation} onCheckedChange={setRealTimePunctuation} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Speaker Diarization" 
              description="Identify different speakers"
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={speakerDiarization} onCheckedChange={setSpeakerDiarization} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Accent Optimization" 
              description="Better recognition for your accent"
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={accentOptimization} onCheckedChange={setAccentOptimization} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Latency Mode" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[100px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Accurate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="accurate">Accurate</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Auto Language Detection" 
              description="Automatically detect spoken language"
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={autoLanguageDetection} onCheckedChange={setAutoLanguageDetection} disabled={!isPremium} />
            </SettingRow>
          </SettingsSection>

          {/* Transcription Output */}
          <SettingsSection 
            title="Transcription Output" 
            icon={<FileText className="w-4 h-4 text-primary" />}
          >
            <SettingRow label="Output Format">
              <Select>
                <SelectTrigger className="w-[120px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Plain Text" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            
            {/* Premium Output Features */}
            <SettingRow 
              label="Smart Formatting" 
              description="Auto paragraphs, headings, bullets"
              isPremium 
              premiumTooltip="AI-powered document formatting"
              isLocked={!isPremium}
            >
              <Switch checked={smartFormatting} onCheckedChange={setSmartFormatting} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Auto Grammar Correction" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={autoGrammar} onCheckedChange={setAutoGrammar} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Tone Control" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[120px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Professional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Show Timestamps" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={timestamps} onCheckedChange={setTimestamps} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Enable Emojis" 
              description="Add emojis to AI-generated content"
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={emojis} onCheckedChange={setEmojis} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Bullet Point Format" 
              description="Generate content in bullet points"
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={bulletPoints} onCheckedChange={setBulletPoints} disabled={!isPremium} />
            </SettingRow>
          </SettingsSection>

          {/* AI Enhancement */}
          <SettingsSection 
            title="AI Enhancement" 
            icon={<Sparkles className="w-4 h-4 text-primary" />}
          >
            {/* AI Art Generation - Premium Feature */}
            <SettingRow 
              label="AI Art Generation" 
              description="Generate 2-4 AI images based on your content"
              isPremium 
              premiumTooltip="Create unique AI-generated artwork from your text"
              isLocked={!isPremium}
            >
              <Switch checked={aiArtGeneration} onCheckedChange={setAiArtGeneration} disabled={!isPremium} />
            </SettingRow>
            
            <SettingRow 
              label="AI Mode" 
              isPremium 
              premiumTooltip="Unlock powerful AI content modes"
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[140px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Summary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="action-items">Action Items</SelectItem>
                  <SelectItem value="meeting-notes">Meeting Notes</SelectItem>
                  <SelectItem value="blog-draft">Blog Draft</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Tone Style" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[120px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Confident" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="polite">Polite</SelectItem>
                  <SelectItem value="assertive">Assertive</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Vocabulary Level" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[120px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Business" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Industry Context" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[120px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Tech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Summary Length" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[100px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Emoji Intensity" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[110px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Off" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="subtle">Subtle</SelectItem>
                  <SelectItem value="expressive">Expressive</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </SettingsSection>

          {/* Export & Sharing */}
          <SettingsSection 
            title="Export & Sharing" 
            icon={<Download className="w-4 h-4 text-primary" />}
          >
            <SettingRow label="Copy Text">
              <Check className="w-4 h-4 text-primary" />
            </SettingRow>
            <SettingRow label="Download TXT">
              <Check className="w-4 h-4 text-primary" />
            </SettingRow>
            
            <SettingRow 
              label="Export PDF" 
              isPremium 
              premiumTooltip="Professional PDF exports"
              isLocked={!isPremium}
            >
              <Check className={cn("w-4 h-4", isPremium ? "text-primary" : "text-muted-foreground")} />
            </SettingRow>
            <SettingRow 
              label="Export DOCX" 
              isPremium 
              isLocked={!isPremium}
            >
              <Check className={cn("w-4 h-4", isPremium ? "text-primary" : "text-muted-foreground")} />
            </SettingRow>
            <SettingRow 
              label="Export Markdown" 
              isPremium 
              isLocked={!isPremium}
            >
              <Check className={cn("w-4 h-4", isPremium ? "text-primary" : "text-muted-foreground")} />
            </SettingRow>
            <SettingRow 
              label="Cloud Save" 
              isPremium 
              isLocked={!isPremium}
            >
              <Check className={cn("w-4 h-4", isPremium ? "text-primary" : "text-muted-foreground")} />
            </SettingRow>
            <SettingRow 
              label="Shareable Links" 
              isPremium 
              isLocked={!isPremium}
            >
              <Check className={cn("w-4 h-4", isPremium ? "text-primary" : "text-muted-foreground")} />
            </SettingRow>
          </SettingsSection>

          {/* Recording Controls */}
          <SettingsSection 
            title="Recording Controls" 
            icon={<CirclePlay className="w-4 h-4 text-primary" />}
          >
            <SettingRow label="Start / Stop">
              <Check className="w-4 h-4 text-primary" />
            </SettingRow>
            <SettingRow label="Pause / Resume">
              <Check className="w-4 h-4 text-primary" />
            </SettingRow>
            <SettingRow label="Waveform Visualization">
              <Switch checked={waveformVisualization} onCheckedChange={setWaveformVisualization} />
            </SettingRow>
            <SettingRow 
              label="Waveform Style" 
              description="Customize dictation waveform appearance"
            >
              <Select>
                <SelectTrigger className="w-[110px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Classic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="blocks">Blocks</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Bar Count" 
              description="Number of waveform bars"
            >
              <Select>
                <SelectTrigger className="w-[80px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="12" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            
            <SettingRow 
              label="Unlimited Recording" 
              isPremium 
              premiumTooltip="No time limits on recordings"
              isLocked={!isPremium}
            >
              <Switch checked={unlimitedRecording} onCheckedChange={setUnlimitedRecording} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Background Recording" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={backgroundRecording} onCheckedChange={setBackgroundRecording} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Auto Pause on Silence" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={autoPauseOnSilence} onCheckedChange={setAutoPauseOnSilence} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Bookmark Moments" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={bookmarkMoments} onCheckedChange={setBookmarkMoments} disabled={!isPremium} />
            </SettingRow>
          </SettingsSection>

          {/* Storage & History */}
          <SettingsSection 
            title="Storage & History" 
            icon={<Database className="w-4 h-4 text-primary" />}
          >
            <SettingRow label="Recent Sessions">
              <span className="text-xs text-muted-foreground">Last 5</span>
            </SettingRow>
            <SettingRow label="Manual Delete">
              <Check className="w-4 h-4 text-primary" />
            </SettingRow>
            
            <SettingRow 
              label="Unlimited Cloud Storage" 
              isPremium 
              premiumTooltip="Never run out of storage space"
              isLocked={!isPremium}
            >
              <Check className={cn("w-4 h-4", isPremium ? "text-primary" : "text-muted-foreground")} />
            </SettingRow>
            <SettingRow 
              label="Searchable History" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={searchableHistory} onCheckedChange={setSearchableHistory} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Folders & Tags" 
              isPremium 
              isLocked={!isPremium}
            >
              <Check className={cn("w-4 h-4", isPremium ? "text-primary" : "text-muted-foreground")} />
            </SettingRow>
            <SettingRow 
              label="Cross-device Sync" 
              isPremium 
              isLocked={!isPremium}
            >
              <Check className={cn("w-4 h-4", isPremium ? "text-primary" : "text-muted-foreground")} />
            </SettingRow>
          </SettingsSection>

          {/* Personalization */}
          <SettingsSection 
            title="Personalization" 
            icon={<Palette className="w-4 h-4 text-primary" />}
          >
            <SettingRow label="Theme">
              <Select value={currentTheme} onValueChange={(v) => onThemeChange(v as Theme)}>
                <SelectTrigger className="w-[140px] h-8 text-xs neu-flat border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map(theme => (
                    <SelectItem 
                      key={theme.id} 
                      value={theme.id}
                      disabled={theme.isPremium && !isPremium}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {theme.previewColors.slice(0, 2).map((c, i) => (
                            <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span>{theme.name}</span>
                        {theme.isPremium && !isPremium && <Lock className="w-2.5 h-2.5 text-accent" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
            
            <SettingRow label="Zoom Level">
              <Select value={zoomLevel} onValueChange={setZoomLevel}>
                <SelectTrigger className="w-[100px] h-8 text-xs neu-flat border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {['25', '50', '75', '80', '90', '100', '110', '125', '150', '175', '200', '225', '250'].map(v => (
                    <SelectItem key={v} value={v}>{v}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Font Style">
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-[140px] h-8 text-xs neu-flat border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  <SelectItem value="system">System Default</SelectItem>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="poppins">Poppins</SelectItem>
                  <SelectItem value="opensans">Open Sans</SelectItem>
                  <SelectItem value="lato">Lato</SelectItem>
                  <SelectItem value="montserrat">Montserrat</SelectItem>
                  <SelectItem value="nunito">Nunito</SelectItem>
                  <SelectItem value="raleway">Raleway</SelectItem>
                  <SelectItem value="playfair">Playfair Display</SelectItem>
                  <SelectItem value="merriweather">Merriweather</SelectItem>
                  <SelectItem value="georgia">Georgia</SelectItem>
                  <SelectItem value="courier">Courier New</SelectItem>
                  <SelectItem value="firacode">Fira Code</SelectItem>
                  <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            
            <SettingRow 
              label="Font Size" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[100px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="UI Density" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[110px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Comfortable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </SettingsSection>

          {/* Privacy & Security */}
          <SettingsSection 
            title="Privacy & Security" 
            icon={<Shield className="w-4 h-4 text-primary" />}
          >
            <SettingRow label="Standard Encryption">
              <Check className="w-4 h-4 text-primary" />
            </SettingRow>
            <SettingRow label="Manual Delete">
              <Check className="w-4 h-4 text-primary" />
            </SettingRow>
            
            <SettingRow 
              label="End-to-End Encryption" 
              description="Maximum security for your content"
              isPremium 
              premiumTooltip="Military-grade encryption for all data"
              isLocked={!isPremium}
            >
              <Switch checked={e2eEncryption} onCheckedChange={setE2eEncryption} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Auto Delete After" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[100px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Never" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow 
              label="Local-only Processing" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={localOnlyProcessing} onCheckedChange={setLocalOnlyProcessing} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="No AI Training Toggle" 
              description="Your data won't train AI models"
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={noAiTraining} onCheckedChange={setNoAiTraining} disabled={!isPremium} />
            </SettingRow>
          </SettingsSection>

          {/* Automation */}
          <SettingsSection 
            title="Automation & Workflows" 
            icon={<Zap className="w-4 h-4 text-primary" />}
          >
            <SettingRow 
              label="Auto Summarize" 
              description="Summarize after each session"
              isPremium 
              premiumTooltip="Automatic AI summaries"
              isLocked={!isPremium}
            >
              <Switch checked={autoSummarize} onCheckedChange={setAutoSummarize} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Auto Export" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={autoExport} onCheckedChange={setAutoExport} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Auto Rename" 
              isPremium 
              isLocked={!isPremium}
            >
              <Switch checked={autoRename} onCheckedChange={setAutoRename} disabled={!isPremium} />
            </SettingRow>
            <SettingRow 
              label="Recording Mode" 
              isPremium 
              isLocked={!isPremium}
            >
              <Select disabled={!isPremium}>
                <SelectTrigger className="w-[120px] h-8 text-xs neu-flat border-0">
                  <SelectValue placeholder="Meeting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </SettingsSection>

          {/* Subscription */}
          <SettingsSection 
            title="Subscription & Billing" 
            icon={<CreditCard className="w-4 h-4 text-primary" />}
          >
            <SettingRow label="Current Plan">
              <span className={cn(
                "text-xs font-bold uppercase px-2 py-1 rounded-lg",
                isPremium 
                  ? "gold-gradient text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {isPremium ? 'Premium' : 'Free'}
              </span>
            </SettingRow>
            
            {isPremium && (
              <>
                <SettingRow label="Usage This Month">
                  <span className="text-xs text-muted-foreground">Unlimited</span>
                </SettingRow>
                <SettingRow label="Invoice History">
                  <button className="text-xs font-semibold text-primary hover:underline">
                    View
                  </button>
                </SettingRow>
              </>
            )}
          </SettingsSection>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/30 bg-gradient-to-r from-card to-muted/30 space-y-3">
          {!isPremium ? (
            <button
              onClick={onUpgrade}
              className="w-full py-4 rounded-2xl gold-gradient text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-premium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium — Unlock Everything
            </button>
          ) : (
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl gold-gradient text-white font-bold text-sm shadow-lg">
                <Crown className="w-5 h-5 fill-current" />
                <span>PREMIUM ACTIVATED</span>
                <Check className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                All features unlocked! Thank you for your support 💎
              </p>
            </div>
          )}
          
          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-3 rounded-2xl neu-flat text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
};
