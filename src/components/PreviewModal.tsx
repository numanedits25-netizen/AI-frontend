// PreviewModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  caption?: string;
  tags?: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const PreviewModal = ({ open, onClose, imageUrl, title, caption, tags, isLoading, error, onRetry }: PreviewModalProps) => {
  const [safeImageUrl, setSafeImageUrl] = useState("");

  useEffect(() => {
    if (imageUrl) setSafeImageUrl(imageUrl);
  }, [imageUrl]);

  const downloadImage = async () => {
    try {
      const response = await fetch(safeImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[96vw] w-full sm:max-w-3xl p-4 sm:p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isLoading ? "Rendering..." : error ? "Preview Error" : "Image Preview"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="w-full bg-black/5 border rounded-lg overflow-hidden relative min-h-[250px] flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center py-10">
                <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full" />
                <p className="mt-4 text-sm text-muted-foreground">Rendering your image...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-10 space-y-3">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-destructive text-center text-sm">{error}</p>
                {onRetry && <Button onClick={onRetry} variant="outline" size="sm">Retry</Button>}
              </div>
            ) : safeImageUrl ? (
              <img src={safeImageUrl} alt="Generated" className="max-w-full w-auto mx-auto object-contain max-h-[70vh]" onError={() => toast.error("Preview load failed")} />
            ) : null}
          </div>

          {!isLoading && !error && (title || caption || tags) && (
            <div className="space-y-2 p-4 border rounded bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                <p className="font-medium text-sm">AI Generated Details</p>
              </div>

              {title && (
                <div>
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="text-sm bg-background p-2 rounded">{title}</p>
                </div>
              )}
              {caption && (
                <div>
                  <p className="text-xs text-muted-foreground">Caption</p>
                  <p className="text-sm bg-background p-2 rounded whitespace-pre-line">{caption}</p>
                </div>
              )}
              {tags && (
                <div>
                  <p className="text-xs text-muted-foreground">Tags</p>
                  <p className="text-sm bg-background p-2 rounded">{tags}</p>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && safeImageUrl && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 bg-gradient-primary" onClick={downloadImage}>
                <Download className="h-4 w-4 mr-2" /> Download Image
              </Button>
              <Button className="flex-1" variant="outline" onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
