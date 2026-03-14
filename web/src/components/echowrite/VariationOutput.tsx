import { useState } from 'react';
import { WritingVariation, SUPPORTED_LANGUAGES } from '@/types/echowrite';
import { 
  Copy, 
  CheckCircle2, 
  Share2, 
  Mail, 
  Globe, 
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { translateText, rephraseText } from '@/services/aiService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VariationOutputProps {
  variations: WritingVariation[];
  selectedVariation: WritingVariation | null;
  onSelectVariation: (v: WritingVariation) => void;
  onApplyToWorkspace: (text: string) => void;
  isLoading: boolean;
}

export const VariationOutput = ({
  variations,
  selectedVariation,
  onSelectVariation,
  onApplyToWorkspace,
  isLoading
}: VariationOutputProps) => {
  const [copied, setCopied] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [displayVariation, setDisplayVariation] = useState<WritingVariation | null>(null);

  // Use displayVariation if set, otherwise use selectedVariation
  const currentVariation = displayVariation || selectedVariation;

  const copyToClipboard = async () => {
    if (currentVariation?.suggestedText) {
      await navigator.clipboard.writeText(currentVariation.suggestedText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTranslate = async (langName: string) => {
    if (!currentVariation || !langName) return;
    setIsTranslating(true);
    try {
      const translated = await translateText(currentVariation.suggestedText, langName);
      setDisplayVariation({ ...currentVariation, suggestedText: translated });
      toast.success(`Translated to ${langName}`);
    } catch (error) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRephrase = async (lengthType: 'simple' | 'medium' | 'long') => {
    if (!currentVariation) return;
    setIsRephrasing(true);
    try {
      const result = await rephraseText(currentVariation.suggestedText, lengthType);
      setDisplayVariation({ ...currentVariation, suggestedText: result });
      toast.success(`Rephrased to ${lengthType} form`);
    } catch (error) {
      toast.error("Rephrasing failed. Please try again.");
    } finally {
      setIsRephrasing(false);
    }
  };

  const shareOutput = (platform: 'whatsapp' | 'email') => {
    if (!currentVariation) return;
    const content = currentVariation.suggestedText;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(content)}`, '_blank');
    } else {
      window.location.href = `mailto:?subject=EchoWrite&body=${encodeURIComponent(content)}`;
    }
  };

  // Reset displayVariation when selectedVariation changes
  const handleSelectVariation = (v: WritingVariation) => {
    setDisplayVariation(null);
    onSelectVariation(v);
  };

  if (isLoading) {
    return (
      <div className="neu-flat rounded-3xl p-16 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full neu-convex flex items-center justify-center mb-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Generating Variations...
        </p>
      </div>
    );
  }

  if (variations.length === 0) {
    return (
      <div className="neu-pressed rounded-3xl p-16 text-center flex flex-col items-center opacity-70">
        <div className="w-16 h-16 rounded-full neu-flat flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Awaiting Input
        </p>
        <p className="text-[10px] text-muted-foreground mt-2">
          Type or dictate, then generate
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Variation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {variations.map((v) => (
          <button
            key={v.id}
            onClick={() => handleSelectVariation(v)}
            className={cn(
              'shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-bold transition-all',
              selectedVariation?.id === v.id
                ? 'style-chip-active'
                : 'neu-flat text-muted-foreground hover:text-foreground'
            )}
          >
            {v.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Selected Variation Content */}
      {currentVariation && (
        <div className="neu-flat rounded-3xl overflow-hidden animate-scale-in p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-xl uppercase self-start">
                {currentVariation.tone} Tone
              </span>
              
              {/* Translate Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl neu-pressed group">
                <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <select
                  className="bg-transparent border-none text-[10px] font-semibold text-muted-foreground outline-none cursor-pointer"
                  onChange={(e) => handleTranslate(e.target.value)}
                  value=""
                  disabled={isTranslating}
                >
                  <option value="" disabled>Translate Output</option>
                  {SUPPORTED_LANGUAGES.map(l => (
                    <option key={l.code} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => shareOutput('whatsapp')}
                className="p-2.5 lg:px-4 lg:py-2.5 rounded-xl neu-button text-primary hover:scale-105 transition-transform flex items-center gap-2"
                title="Share via WhatsApp"
                aria-label="Share via WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
              </button>
              <button
                onClick={() => shareOutput('email')}
                className="p-2.5 lg:px-4 lg:py-2.5 rounded-xl neu-button text-accent hover:scale-105 transition-transform flex items-center gap-2"
                title="Send via Email"
                aria-label="Send via Email"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">Email</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="p-2.5 lg:px-4 lg:py-2.5 rounded-xl neu-button text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                title="Copy to clipboard"
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">Copy</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 rounded-2xl neu-pressed text-foreground text-base leading-relaxed whitespace-pre-wrap relative min-h-[180px]">
            {(isRephrasing || isTranslating) && (
              <div className="absolute inset-0 bg-card/70 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-10">
                <RefreshCw className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}
            {currentVariation.suggestedText}
          </div>

          {/* Rephrase Options */}
          <div className="mt-5 flex gap-2">
            {(['simple', 'medium', 'long'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleRephrase(type)}
                disabled={isRephrasing}
                className="flex-1 py-3 px-3 rounded-xl neu-button text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
              >
                {type}
              </button>
            ))}
          </div>

          {/* Apply Button */}
          <button
            onClick={() => onApplyToWorkspace(currentVariation.suggestedText)}
            className="w-full mt-5 py-4 primary-button rounded-2xl flex items-center justify-center gap-2"
          >
            Apply to Workspace
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
