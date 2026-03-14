import { HistoryItem } from '@/types/echowrite';
import { History as HistoryIcon, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistorySidebarProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: HistoryItem) => void;
}

export const HistorySidebar = ({ history, isOpen, onClose, onSelectItem }: HistorySidebarProps) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-80 z-50 transition-transform duration-500 transform',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full neu-flat rounded-r-3xl p-6 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl neu-convex flex items-center justify-center">
                <HistoryIcon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                History
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl neu-button text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
            {history.length === 0 ? (
              <div className="text-center mt-16 px-4">
                <div className="w-16 h-16 rounded-full neu-pressed mx-auto flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  No History Yet
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Your generated content will appear here
                </p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-full text-left p-4 rounded-2xl neu-flat hover:scale-[1.02] transition-all"
                >
                  <span className="text-[9px] font-bold text-primary uppercase block mb-1.5">
                    {item.style}
                  </span>
                  <p className="text-sm text-foreground line-clamp-2 font-medium">
                    {item.originalText}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
