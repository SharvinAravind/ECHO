import { useState, useImperativeHandle, forwardRef } from 'react';
import { LengthVariations, getLengthVariations, LengthVariation, translateText } from '@/services/aiService';
import { Copy, CheckCircle2, ArrowRight, RefreshCw, FileText, AlignLeft, BookOpen, Share2, Mail, MessageCircle, Download, Wand2, Languages, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';
import { SUPPORTED_LANGUAGES } from '@/types/echowrite';

// HTML escape function for safe text insertion
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

interface LengthVariationsPanelProps {
  text: string;
  onApplyToWorkspace: (text: string) => void;
}

export interface LengthVariationsPanelRef {
  generate: () => Promise<void>;
}

type LengthType = 'simple' | 'medium' | 'long' | 'detailed';

export const LengthVariationsPanel = forwardRef<LengthVariationsPanelRef, LengthVariationsPanelProps>(
  ({ text, onApplyToWorkspace }, ref) => {
  const [variations, setVariations] = useState<LengthVariations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<LengthType>('medium');
  const [selectedVariation, setSelectedVariation] = useState<LengthVariation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number[]>([3]); // 1-5 slider for variation count
  const [translateLang, setTranslateLang] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<string | null>(null);

  // Map slider value to number of variations to show
  const variationCount = sliderValue[0];

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    // Update displayed variations based on count
    if (variations?.[selectedType]) {
      setSelectedVariation(variations[selectedType][0] || null);
    }
  };

  const handleLengthTypeChange = (type: LengthType) => {
    setSelectedType(type);
    if (variations?.[type]?.[0]) {
      setSelectedVariation(variations[type][0]);
    }
  };

  const fetchVariations = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text in the workspace');
      throw new Error('No text in workspace');
    }
    if (text.trim().length < 3) {
      toast.error('Please enter at least 3 characters');
      throw new Error('Text too short');
    }
    
    setIsLoading(true);
    try {
      const result = await getLengthVariations(text);
      setVariations(result);
      // Auto-select first variation of current type
      if (result[selectedType]?.[0]) {
        setSelectedVariation(result[selectedType][0]);
      }
      toast.success('Length variations generated!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Length variations error:", error);
      if (msg.includes("API key") || msg.includes("VITE_OPENROUTER")) {
        toast.error("API key missing. Add VITE_OPENROUTER_API_KEY to .env and restart.");
      } else if (msg.includes("Network") || msg.includes("fetch")) {
        toast.error("Network error. Check connection and try again.");
      } else {
        toast.error(msg.length > 60 ? "Length variations failed. Check console." : msg);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Expose generate method for parent to call
  useImperativeHandle(ref, () => ({
    generate: fetchVariations
  }));

  const copyToClipboard = async (variation: LengthVariation) => {
    await navigator.clipboard.writeText(variation.text);
    setCopiedId(variation.id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTranslateVariation = async (variation: LengthVariation) => {
    if (!translateLang) {
      toast.error('Please select a language first');
      return;
    }
    const langName = SUPPORTED_LANGUAGES.find(l => l.code === translateLang)?.name || translateLang;
    setIsTranslating(variation.id);
    try {
      const translated = await translateText(variation.text, langName);
      // Update the variation text in-place
      if (variations) {
        const typeVariations = variations[selectedType];
        const idx = typeVariations?.findIndex(v => v.id === variation.id);
        if (idx !== undefined && idx >= 0 && typeVariations) {
          typeVariations[idx] = { ...typeVariations[idx], text: translated, wordCount: translated.split(/\s+/).filter(Boolean).length };
          setVariations({ ...variations });
          setSelectedVariation(typeVariations[idx]);
        }
      }
      toast.success(`Translated to ${langName}!`);
    } catch (err) {
      toast.error('Translation failed');
    } finally {
      setIsTranslating(null);
    }
  };

  const shareToWhatsApp = (variation: LengthVariation) => {
    const text = encodeURIComponent(variation.text);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToEmail = (variation: LengthVariation) => {
    const subject = encodeURIComponent('Shared from EchoWrite');
    const body = encodeURIComponent(variation.text);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const downloadAsPdf = async (variation: LengthVariation) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Sanitize user-generated content to prevent XSS
      const safeType = escapeHtml(selectedType.charAt(0).toUpperCase() + selectedType.slice(1));
      const safeText = escapeHtml(variation.text);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>EchoWrite Export</title>
          <style>
            body { font-family: Georgia, serif; padding: 40px; line-height: 1.8; }
            h1 { font-size: 18px; color: #333; margin-bottom: 20px; }
            p { font-size: 14px; color: #444; white-space: pre-wrap; }
            .footer { margin-top: 40px; font-size: 11px; color: #888; }
          </style>
        </head>
        <body>
          <h1>EchoWrite - ${safeType} Variation</h1>
          <p>${safeText}</p>
          <div class="footer">Generated by EchoWrite AI Writing Assistant</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('Opening print dialog...');
  };

  const lengthLabels = {
    simple: { icon: AlignLeft, label: 'Short', emoji: '📝' },
    medium: { icon: FileText, label: 'Medium', emoji: '📄' },
    long: { icon: BookOpen, label: 'Long', emoji: '📚' },
    detailed: { icon: FileText, label: 'Detailed', emoji: '📖' },
  };

  const currentVariations = variations?.[selectedType]?.slice(0, variationCount) || [];

  return (
    <div className="neu-flat rounded-2xl p-4 sm:p-5">
      {/* Header with Length Type Buttons + Slider + Generate Button - Responsive */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Length Type Buttons - Simple / Medium / Long with Icon + Label */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {(Object.keys(lengthLabels) as LengthType[]).map((type) => {
            const { icon: Icon, label, emoji } = lengthLabels[type];
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => handleLengthTypeChange(type)}
                className={cn(
                  'flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex-1 sm:flex-none justify-center',
                  isActive
                    ? 'style-chip-active'
                    : 'neu-flat text-muted-foreground hover:text-foreground hover:scale-[1.02]'
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Slider for Variation Count (1-5) - Compact */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 neu-flat px-2 py-1.5 rounded-lg">
          <span className="text-[8px] sm:text-[9px] text-muted-foreground font-bold">1</span>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            min={1}
            max={5}
            step={1}
            className="flex-1"
          />
          <span className="text-[8px] sm:text-[9px] text-muted-foreground font-bold">5</span>
          <span className="text-[8px] sm:text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded">
            {variationCount}
          </span>
        </div>

        {/* Translation Language Dropdown */}
        <div className="flex items-center gap-1.5 neu-flat px-2 py-1.5 rounded-lg">
          <Languages className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <Select value={translateLang} onValueChange={setTranslateLang}>
            <SelectTrigger className="w-[100px] sm:w-[130px] h-7 text-[10px] sm:text-xs neu-flat border-0 px-1.5">
              <SelectValue placeholder="Translate" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              {SUPPORTED_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code} className="text-xs">
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button - Prominent */}
        <button
          onClick={fetchVariations}
          disabled={isLoading || !text.trim()}
          className={cn(
            'flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-md',
            isLoading ? 'neu-pressed opacity-70' : 'primary-button hover:scale-[1.02]'
          )}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Generate Lengths</span>
            </>
          )}
        </button>
      </div>

      {/* Variations Display */}
      {isLoading ? (
        <div className="neu-pressed rounded-xl p-8 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Generating {variationCount} {selectedType} variations...
          </p>
        </div>
      ) : !variations ? (
        <div className="neu-pressed rounded-xl p-8 text-center opacity-70">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            📝 Length Variations
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Enter text in workspace and click Generate
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentVariations.map((variation, index) => (
            <div
              key={variation.id}
              onClick={() => setSelectedVariation(variation)}
              className={cn(
                'p-4 rounded-xl cursor-pointer transition-all',
                selectedVariation?.id === variation.id
                  ? 'neu-pressed ring-2 ring-primary'
                  : 'neu-flat hover:scale-[1.005]'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase">
                    ✨ Variation {index + 1}
                  </span>
                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {variation.wordCount} words
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Translate Button */}
                  {translateLang && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTranslateVariation(variation);
                      }}
                      disabled={isTranslating === variation.id}
                      className="p-1.5 rounded-lg neu-button hover:text-primary transition-colors"
                      title={`Translate to ${SUPPORTED_LANGUAGES.find(l => l.code === translateLang)?.name || 'selected language'}`}
                    >
                      {isTranslating === variation.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Languages className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  {/* PDF Download */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadAsPdf(variation);
                    }}
                    className="p-1.5 rounded-lg neu-button hover:text-primary transition-colors"
                    title="Download as PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Copy */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(variation);
                    }}
                    className="p-1.5 rounded-lg neu-button hover:text-primary transition-colors"
                    title="Copy"
                  >
                    {copiedId === variation.id ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  
                  {/* Share Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg neu-button hover:text-primary transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="neu-flat border-border">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          shareToWhatsApp(variation);
                        }}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-accent" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          shareToEmail(variation);
                        }}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {variation.text}
              </p>

              {/* Apply Button */}
              {selectedVariation?.id === variation.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyToWorkspace(variation.text);
                  }}
                  className="mt-3 w-full py-2.5 primary-button rounded-lg flex items-center justify-center gap-2 text-xs"
                >
                  Apply to Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

LengthVariationsPanel.displayName = 'LengthVariationsPanel';
