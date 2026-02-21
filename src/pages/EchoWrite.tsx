import { useState, useCallback, useEffect, useRef } from 'react';
import { WritingStyle, WritingVariation, SUPPORTED_LANGUAGES, HistoryItem, Theme, User } from '@/types/echowrite';
import { getWritingVariations } from '@/services/aiService';
import { Workspace } from '@/components/echowrite/Workspace';
import { HistorySidebar } from '@/components/echowrite/HistorySidebar';
import { AuthScreen } from '@/components/echowrite/AuthScreen';
import { Logo } from '@/components/echowrite/Logo';
import { PremiumBadge } from '@/components/echowrite/PremiumBadge';
import { SnowEffect } from '@/components/echowrite/SnowEffect';
import { SettingsPanel } from '@/components/echowrite/SettingsPanel';
import { AIContentGenerator, AIContentGeneratorRef } from '@/components/echowrite/AIContentGenerator';
import { VisualContentHub, VisualContentHubRef } from '@/components/echowrite/VisualContentHub';
import { PaymentModal } from '@/components/echowrite/PaymentModal';
import { StyleButtonsPopover } from '@/components/echowrite/StyleButtonsPopover';
import { useDictation } from '@/hooks/useDictation';
import { useHistory } from '@/hooks/useHistory';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { History as HistoryIcon, Languages, Sparkles, Snowflake, User as UserIcon, Loader2, Zap, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const EchoWrite = () => {
  // Real Supabase Auth
  const {
    authUser,
    loading,
    signOut,
    refreshUserData
  } = useAuth();

  // History
  const {
    history,
    addToHistory
  } = useHistory();

  // Snow effect toggle
  const [snowEnabled, setSnowEnabled] = useState(false);

  // Main State
  const [text, setText] = useState('');
  const [style, setStyle] = useState<WritingStyle>(WritingStyle.PROFESSIONAL_EMAIL);
  const [variations, setVariations] = useState<WritingVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<WritingVariation | null>(null);
  const [interimText, setInterimText] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [inputLang, setInputLang] = useState('en-US');
  const [currentTheme, setCurrentTheme] = useState<Theme>('neumorphic-green');

  // Refs for triggering generate on child components
  const visualContentRef = useRef<VisualContentHubRef>(null);
  const aiContentRef = useRef<AIContentGeneratorRef>(null);

  // Apply theme class to body
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-golden-cream', 'theme-glassmorphism', 'theme-neo-brutalism', 'theme-skeuomorphism', 'theme-clay-morphism', 'theme-minimalism', 'theme-liquid-glass', 'theme-ocean-deep', 'theme-sunset-glow');

    // Add current theme class (neumorphic-green is default, no class needed)
    if (currentTheme !== 'neumorphic-green') {
      document.documentElement.classList.add(`theme-${currentTheme}`);
    }
  }, [currentTheme]);

  // Voice Commands Handler
  const handleVoiceCommand = useCallback((command: string): boolean => {
    if (command.includes("stop dictation")) {
      dictation.stop();
      return true;
    }
    if (command.includes("open history")) {
      setHistoryOpen(true);
      return true;
    }
    if (command.includes("close history")) {
      setHistoryOpen(false);
      return true;
    }
    if (command.includes("clear workspace")) {
      setText('');
      setInterimText('');
      return true;
    }
    if (command.includes("generate content") || command.includes("start refining")) {
      handleProcess(style);
      return true;
    }
    return false;
  }, [style]);

  // Dictation Hook
  const dictation = useDictation({
    lang: inputLang,
    onInterimResult: setInterimText,
    onFinalResult: finalText => {
      setText(prev => (prev ? prev + ' ' : '') + finalText);
    },
    onVoiceCommand: handleVoiceCommand
  });

  // Process text with AI
  const handleProcess = useCallback(async (targetStyle: WritingStyle) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setStyle(targetStyle);
    try {
      const result = await getWritingVariations(text, targetStyle);
      setVariations(result.variations);
      setSelectedVariation(result.variations[0] || null);
      addToHistory(text, targetStyle, result.variations);
      toast.success("Generated 8 variations!");
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Unauthorized') || err.message?.includes('Invalid token')) {
        toast.error("Please sign in to generate variations");
      } else if (err.message?.includes('Usage limit exceeded')) {
        toast.error("Daily limit reached. Upgrade to premium for unlimited generations!");
      } else if (err.message?.includes('503') || err.message?.includes('temporarily busy')) {
        toast.error("Service is busy. Please try again in a moment.");
      } else {
        toast.error("Generation failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [text, isLoading, addToHistory]);

  // Generate All - triggers style variations, length variations, and visual content simultaneously
  const handleGenerateAll = useCallback(async () => {
    if (!text.trim() || isLoading) return;
    const tasks: Promise<unknown>[] = [];

    // Trigger style variations
    tasks.push(handleProcess(style));

    // Trigger visual content generation
    if (visualContentRef.current) {
      tasks.push(visualContentRef.current.generate());
    }

    // Trigger length variations generation
    if (aiContentRef.current) {
      tasks.push(aiContentRef.current.generateLengthVariations());
    }
    await Promise.allSettled(tasks);
  }, [text, isLoading, style, handleProcess]);

  // Handle history item selection
  const handleHistorySelect = (item: HistoryItem) => {
    setText(item.originalText);
    setVariations(item.variations);
    setSelectedVariation(item.variations[0] || null);
    setHistoryOpen(false);
  };

  // Clear workspace - full reset
  const handleClear = () => {
    setText('');
    setVariations([]);
    setSelectedVariation(null);
    setInterimText('');
  };

  // Apply variation to workspace
  const handleApplyToWorkspace = (content: string) => {
    setText(content);
    toast.success("Applied to workspace!");
  };

  // Handle logout
  const handleLogout = async () => {
    const {
      error
    } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Logged out successfully");
    }
    setSettingsOpen(false);
  };

  // Handle upgrade
  const handleUpgrade = () => {
    setSettingsOpen(false);
    setPaymentOpen(true);
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    // Refresh user data to get updated premium status
    await refreshUserData();
    toast.success('Welcome to Premium! 🎉');
  };

  // Show loading state
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Logo size="xl" animated />
          <div className="flex items-center gap-2 mt-4 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>;
  }

  // Show auth screen if not logged in
  if (!authUser) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  // Convert authUser to User type for existing components
  const user: User = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    tier: authUser.tier,
    usageCount: authUser.usageCount,
    maxUsage: authUser.maxUsage
  };
  return <div className="min-h-screen flex flex-col relative transition-colors duration-700 bg-background overflow-hidden font-sans">
      {/* Snow Effect */}
      <SnowEffect enabled={snowEnabled} />
      {/* History Sidebar */}
      <HistorySidebar history={history} isOpen={historyOpen} onClose={() => setHistoryOpen(false)} onSelectItem={handleHistorySelect} />

      {/* Navbar - Matching Login Page Branding - Responsive */}
      <header className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 glass-frosted sticky top-0 z-40">
        <TooltipProvider delayDuration={300}>
          {/* Mobile: Three-row layout for complete visibility */}
          <div className="flex flex-col gap-2 sm:hidden">
            {/* Row 1: Logo + PRO badge */}
            <div className="flex justify-center items-center">
              <div className="flex items-center gap-2">
                <Logo size="lg" showText animated />
                {user.tier === 'premium' && <PremiumBadge variant="badge" activated size="sm" />}
              </div>
            </div>
            
            {/* Row 2: All action buttons - evenly spaced */}
            <div className="grid grid-cols-4 gap-2 px-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setHistoryOpen(!historyOpen)} className="h-11 rounded-xl neu-button text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                    <HistoryIcon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="font-semibold text-[11px]">History</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>View History</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setSnowEnabled(!snowEnabled)} className={`h-11 rounded-xl neu-button transition-all flex items-center justify-center gap-1.5 ${snowEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Snowflake className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="font-semibold text-[11px]">{snowEnabled ? 'On' : 'Snow'}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{snowEnabled ? 'Disable Snow' : 'Enable Snow'}</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setSettingsOpen(!settingsOpen)} className="h-11 rounded-xl neu-button text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-1.5">
                    <Settings className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="font-semibold text-[11px]">Settings</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Settings & Profile</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button disabled={!text || isLoading} onClick={handleGenerateAll} className="h-11 rounded-xl primary-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                    <Sparkles className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="text-[11px] font-bold">Generate</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Generate All Content</p></TooltipContent>
              </Tooltip>
            </div>
            
            {/* Row 3: Language selector - full width */}
            <div className="flex justify-center">
              <select value={inputLang} onChange={e => setInputLang(e.target.value)} className="bg-transparent border-none text-[10px] font-bold text-muted-foreground outline-none cursor-pointer neu-flat rounded-xl px-3 py-2 w-full text-center">
                {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>
                    {l.flag} {l.name} {l.displayNative}
                  </option>)}
              </select>
            </div>
          </div>

          {/* Tablet/Desktop: Single row layout */}
          <div className="hidden sm:flex justify-between items-center">
            <div className="flex items-center gap-3 lg:gap-4">
              {/* History Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setHistoryOpen(!historyOpen)} className="p-2 sm:p-2.5 rounded-xl neu-button text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xl:inline text-xs font-semibold">History</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="xl:hidden">
                  <p>View History</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Logo + Brand with PRO badge */}
              <div className="relative flex items-center">
                <Logo size="2xl" showText animated />
                {user.tier === 'premium' && <div className="absolute -top-1 -right-2">
                    <PremiumBadge variant="large" activated />
                  </div>}
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Snow Toggle with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setSnowEnabled(!snowEnabled)} className={`p-2 sm:p-2.5 rounded-xl neu-button transition-all flex items-center gap-2 ${snowEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Snowflake className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xl:inline text-xs font-semibold">{snowEnabled ? 'Snow On' : 'Snow'}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="xl:hidden">
                  <p>{snowEnabled ? 'Disable snow effect' : 'Enable snow effect'}</p>
                </TooltipContent>
              </Tooltip>

              {/* Language Selector with Flags - Hidden on tablet, shown on desktop */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl neu-flat transition-transform hover:scale-[1.02]">
                    <Languages className="w-4 h-4 text-primary flex-shrink-0" />
                    <select value={inputLang} onChange={e => setInputLang(e.target.value)} className="bg-transparent border-none text-[10px] font-bold text-muted-foreground outline-none cursor-pointer max-w-[200px] truncate">
                      {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>
                          {l.flag} {l.name} {l.displayNative}
                        </option>)}
                    </select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px]">
                  <p className="text-xs">
                    {SUPPORTED_LANGUAGES.find(l => l.code === inputLang)?.flag} {SUPPORTED_LANGUAGES.find(l => l.code === inputLang)?.name} {SUPPORTED_LANGUAGES.find(l => l.code === inputLang)?.displayNative}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Compact Language Selector - Tablet only */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="lg:hidden flex items-center">
                    <select value={inputLang} onChange={e => setInputLang(e.target.value)} className="bg-transparent border-none text-xs font-bold text-muted-foreground outline-none cursor-pointer neu-flat rounded-xl px-2 py-2 min-w-[180px] max-w-[200px]">
                      {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>
                          {l.flag} {l.name} {l.displayNative}
                        </option>)}
                    </select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px]">
                  <p className="text-xs font-medium">
                    {SUPPORTED_LANGUAGES.find(l => l.code === inputLang)?.flag} {SUPPORTED_LANGUAGES.find(l => l.code === inputLang)?.name} {SUPPORTED_LANGUAGES.find(l => l.code === inputLang)?.displayNative}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Unified Profile/Settings Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-2 sm:p-2.5 rounded-xl neu-button hover:scale-[1.02] transition-all flex items-center gap-2">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <span className="hidden xl:inline text-xs font-semibold text-muted-foreground">Settings</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="xl:hidden">
                  <p>Settings & Profile</p>
                </TooltipContent>
              </Tooltip>

              {/* Generate All Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button disabled={!text || isLoading} onClick={handleGenerateAll} className="primary-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs px-4 lg:px-6 py-2.5 lg:py-3">
                    <Sparkles className="w-4 h-4" /> 
                    <span>GENERATE ALL</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Generate All Variations</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </header>

      {/* Main Content - Vertical Layout - Responsive */}
      <div className="flex flex-1 relative z-10 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 scrollbar-hide">
          {/* Row 0: Writing Style Selection - Above Workspace */}
          <div className="neu-flat rounded-2xl sm:rounded-3xl p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl neu-convex flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[11px] sm:text-sm font-bold text-foreground truncate">🎨 Select Writing Style.. 🖋</h3>
                <p className="text-[10px] sm:text-[10px] text-muted-foreground">Choose your preferred writing style</p>
              </div>
            </div>
            <StyleButtonsPopover currentStyle={style} onSelect={handleProcess} isLoading={isLoading} />
          </div>

          {/* Row 1: Workspace - Full Width */}
          <Workspace text={text} onTextChange={setText} onClear={handleClear} onEnterPress={() => handleProcess(style)} interimText={interimText} isDictating={dictation.isDictating} isDictationPaused={dictation.isPaused} dictationTime={dictation.dictationTime} onStartDictation={dictation.start} onStopDictation={dictation.stop} onTogglePause={dictation.togglePause} />

          {/* Row 2: AI-Powered Content Generation with Clear */}
          <AIContentGenerator ref={aiContentRef} currentStyle={style} onSelectStyle={handleProcess} variations={variations} selectedVariation={selectedVariation} onSelectVariation={setSelectedVariation} onApplyToWorkspace={handleApplyToWorkspace} isLoading={isLoading} workspaceText={text} onClear={handleClear} />

          {/* Row 3: Visual Content Creation */}
          <VisualContentHub ref={visualContentRef} workspaceText={text} />
        </main>
      </div>

      {/* Settings Panel - Unified with all options */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} currentTheme={currentTheme} onThemeChange={setCurrentTheme} onUpgrade={handleUpgrade} onLogout={handleLogout} />

      {/* Payment Modal */}
      <PaymentModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} onSuccess={handlePaymentSuccess} />
    </div>;
};
export default EchoWrite;