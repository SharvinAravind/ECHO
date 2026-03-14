import { useState, useRef } from 'react';
import { Image, Upload, X, Loader2, Camera, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageSelect: (file: File | null, preview: string | null) => void;
  currentPreview?: string | null;
  className?: string;
}

export const ImageUpload = ({ onImageSelect, currentPreview, className }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentPreview || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreview(result);
        onImageSelect(file, result);
        setIsLoading(false);
        toast.success('Image attached!');
      };
      reader.onerror = () => {
        toast.error('Failed to read image');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to load image');
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null, null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={cn('neu-flat rounded-2xl p-4', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative group">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden neu-pressed shrink-0">
              <img 
                src={preview} 
                alt="Uploaded preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">📎 Image Attached</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                This image will be used as context for AI generation
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-2.5 rounded-xl neu-button text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex items-center justify-center gap-4 py-4 px-6 rounded-xl cursor-pointer transition-all',
            isDragging 
              ? 'neu-pressed border-2 border-dashed border-primary' 
              : 'neu-flat hover:scale-[1.01]',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Loading...</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl neu-convex flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">📷 Attach Image</p>
                  <p className="text-[10px] text-muted-foreground">
                    Click or drag & drop
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
