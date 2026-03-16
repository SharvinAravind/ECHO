import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import DOMPurify from 'dompurify';
import { 
  Layout, 
  GitBranch, 
  Brain, 
  Clock, 
  Download, 
  Maximize2,
  Sparkles,
  RefreshCw,
  X,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateVisualContent, VisualContent } from '@/services/aiService';
import { toast } from 'sonner';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';

type VisualType = 'diagram' | 'flowchart' | 'mindmap' | 'timeline' | 'orgchart' | 'sequence';

interface VisualItem {
  id: string;
  type: VisualType;
  title: string;
  mermaidCode: string;
  description: string;
  svg?: string;
}

const visualTypes = [
  { id: 'diagram', label: 'Diagrams', icon: Layout, emoji: '📊' },
  { id: 'flowchart', label: 'Flowcharts', icon: GitBranch, emoji: '🔀' },
  { id: 'mindmap', label: 'Mind Maps', icon: Brain, emoji: '🧠' },
  { id: 'timeline', label: 'Timelines', icon: Clock, emoji: '⏱️' },
  { id: 'orgchart', label: 'Org Charts', icon: Layout, emoji: '🏢' },
  { id: 'sequence', label: 'Sequences', icon: GitBranch, emoji: '🔄' },
] as const;

interface VisualContentHubProps {
  workspaceText?: string;
}

export interface VisualContentHubRef {
  generate: () => Promise<void>;
}

// Initialize mermaid with strict security
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'strict',
  fontFamily: 'inherit',
});

// Sanitize SVG content to prevent XSS attacks
const sanitizeSvg = (svg: string): string => {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
  });
};

export const VisualContentHub = forwardRef<VisualContentHubRef, VisualContentHubProps>(
  ({ workspaceText = '' }, ref) => {
  const [selectedType, setSelectedType] = useState<VisualType>('diagram');
  const [generatedItems, setGeneratedItems] = useState<VisualItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullscreenItem, setFullscreenItem] = useState<VisualItem | null>(null);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const mermaidRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastTextRef = useRef<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Limit concurrency to avoid Gemini rate limits
  const runWithConcurrency = async (
    items: typeof visualTypes,
    fn: (t: (typeof visualTypes)[0]) => Promise<VisualItem>,
    concurrency = 2
  ) => {
    const results: VisualItem[] = new Array(items.length);
    let i = 0;
    const worker = async () => {
      while (i < items.length) {
        const idx = i++;
        try {
          results[idx] = await fn(items[idx]);
        } catch (e) {
          throw e;
        }
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results.filter(Boolean);
  };

  const handleManualGenerate = async () => {
    if (!workspaceText.trim()) {
      toast.error('Please enter some text in workspace');
      throw new Error('No text in workspace');
    }
    setIsGenerating(true);
    lastTextRef.current = workspaceText;
    try {
      const newItems = await runWithConcurrency(visualTypes, async (type) => {
        const result = await generateVisualContent(workspaceText, type.id);
        return {
          id: `${type.id}-${Date.now()}`,
          type: type.id,
          title: result.title,
          mermaidCode: result.mermaidCode,
          description: result.description,
        } as VisualItem;
      });
      setGeneratedItems(newItems);
      toast.success('Visual content generated!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error generating visuals:', error);
      if (msg.includes('API key') || msg.includes('VITE_OPENROUTER')) {
        toast.error('API key issue. Add VITE_OPENROUTER_API_KEY to .env and restart.');
      } else if (msg.includes('Network') || msg.includes('fetch')) {
        toast.error('Network error. Check connection and try again.');
      } else {
        toast.error(msg.length > 60 ? 'Visual generation failed. Check console.' : msg);
      }
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Expose generate method for parent to call
  useImperativeHandle(ref, () => ({
    generate: handleManualGenerate
  }));

  // Render mermaid diagrams with sanitization
  useEffect(() => {
    const renderDiagrams = async () => {
      for (const item of generatedItems) {
        const element = mermaidRefs.current.get(item.id);
        if (element && item.mermaidCode && !item.svg) {
          try {
            const { svg } = await mermaid.render(`mermaid-${item.id}`, item.mermaidCode);
            // Sanitize the SVG before storing
            const sanitizedSvg = sanitizeSvg(svg);
            setGeneratedItems(prev => 
              prev.map(i => i.id === item.id ? { ...i, svg: sanitizedSvg } : i)
            );
          } catch (err) {
            console.error('Mermaid render error:', err);
          }
        }
      }
    };
    renderDiagrams();
  }, [generatedItems]);

  // Auto-generate visual content when workspace text changes (only if autoGenerate is enabled)
  // Now works with any text (including single words)
  useEffect(() => {
    if (!autoGenerate) return;
    if (!workspaceText.trim()) return;
    if (workspaceText === lastTextRef.current) return;

    // Debounce the generation
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      lastTextRef.current = workspaceText;
      setIsGenerating(true);
      try {
        const newItems = await runWithConcurrency(visualTypes, async (type) => {
          const result = await generateVisualContent(workspaceText, type.id);
          return {
            id: `${type.id}-${Date.now()}`,
            type: type.id,
            title: result.title,
            mermaidCode: result.mermaidCode,
            description: result.description,
          } as VisualItem;
        });
        setGeneratedItems(newItems);
        toast.success('Visual content generated!');
      } catch (error) {
        console.error('Error generating visuals:', error);
        toast.error('Failed to generate visual content');
      } finally {
        setIsGenerating(false);
      }
    }, 2000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [workspaceText, autoGenerate]);

  const handleDownload = (item: VisualItem) => {
    if (!item.svg) return;
    
    const blob = new Blob([item.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title.replace(/\s+/g, '-').toLowerCase()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const filteredItems = generatedItems.filter(item => item.type === selectedType);

  return (
    <div className="neu-flat rounded-2xl sm:rounded-3xl p-4 sm:p-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl neu-convex flex items-center justify-center flex-shrink-0">
            <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-foreground">Visual Content Creation</h3>
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">
              Diagrams • Flowcharts • Mind Maps • Timelines
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Auto-generate toggle */}
          <label className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground cursor-pointer neu-flat px-3 py-2 rounded-xl">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded accent-primary"
            />
            Auto-Generate
          </label>
          
          {/* Generate Button - Prominent and clearly visible */}
          <Button
            onClick={handleManualGenerate}
            disabled={isGenerating || !workspaceText.trim()}
            size="sm"
            className={cn(
              "gap-2 font-bold text-xs px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all",
              isGenerating 
                ? "neu-pressed opacity-70" 
                : "primary-button hover:scale-[1.02] shadow-lg"
            )}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Visuals</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Visual Type Selector with Icons + Labels - Responsive */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide pb-1">
        {visualTypes.map((type) => {
          const Icon = type.icon;
          const count = generatedItems.filter(i => i.type === type.id).length;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all shrink-0',
                selectedType === type.id
                  ? 'style-chip-active'
                  : 'neu-flat text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{type.label}</span>
              {count > 0 && (
                <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] sm:text-[10px] font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="group relative rounded-2xl neu-pressed overflow-hidden"
            >
              {/* Visual Preview */}
              <div 
                ref={(el) => {
                  if (el) mermaidRefs.current.set(item.id, el);
                }}
                className="bg-background p-4 min-h-[200px] flex items-center justify-center"
              >
                {item.svg ? (
                  <div 
                    className="w-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(item.svg) }}
                  />
                ) : (
                  <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
                )}
              </div>
              
              {/* Title & Description */}
              <div className="p-3 border-t border-border/30">
                <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
              </div>
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => handleDownload(item)}
                  className="p-3 rounded-xl bg-background/90 hover:bg-background transition-colors"
                  title="Download SVG"
                >
                  <Download className="w-5 h-5 text-foreground" />
                </button>
                <button 
                  onClick={() => setFullscreenItem(item)}
                  className="p-3 rounded-xl bg-background/90 hover:bg-background transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl neu-pressed p-8 text-center">
          <div className="w-12 h-12 rounded-xl neu-flat flex items-center justify-center mx-auto mb-3">
            {selectedType === 'diagram' && <Layout className="w-6 h-6 text-muted-foreground/50" />}
            {selectedType === 'flowchart' && <GitBranch className="w-6 h-6 text-muted-foreground/50" />}
            {selectedType === 'mindmap' && <Brain className="w-6 h-6 text-muted-foreground/50" />}
            {selectedType === 'timeline' && <Clock className="w-6 h-6 text-muted-foreground/50" />}
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {isGenerating ? 'Generating...' : `No ${selectedType}s yet`}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isGenerating 
              ? 'Creating visual content from your text...'
              : 'Enter any text in workspace and click Generate'
            }
          </p>
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreenItem && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setFullscreenItem(null)}
        >
          <button 
            onClick={() => setFullscreenItem(null)}
            className="absolute top-6 right-6 p-3 rounded-xl neu-button"
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="max-w-5xl max-h-[80vh] overflow-auto bg-card rounded-3xl neu-flat p-8"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">{fullscreenItem.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{fullscreenItem.description}</p>
            {fullscreenItem.svg && (
              <div 
                className="w-full"
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(fullscreenItem.svg) }}
              />
            )}
            <button
              onClick={() => handleDownload(fullscreenItem)}
              className="mt-6 primary-button flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download SVG
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

VisualContentHub.displayName = 'VisualContentHub';
