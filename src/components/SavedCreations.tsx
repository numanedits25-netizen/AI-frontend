// SavedCreations.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { toast } from "sonner";

interface SavedItem {
  id: string;
  imageUrl: string;
  caption?: string;
  tags?: string;
  createdAt: string;
}

export default function SavedCreations() {
  const [saved, setSaved] = useState<SavedItem[]>([]);

  // Load saved creations
  useEffect(() => {
    const existing = localStorage.getItem("saved_creations");
    if (existing) {
      setSaved(JSON.parse(existing));
    }
  }, []);

  // Save list back to storage
  const syncStorage = (items: SavedItem[]) => {
    setSaved(items);
    localStorage.setItem("saved_creations", JSON.stringify(items));
  };

  // Delete single item
  const handleDelete = (id: string) => {
    const updated = saved.filter((item) => item.id !== id);
    syncStorage(updated);
    toast.success("Deleted!");
  };

  // Download an image
  const handleDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");

      a.href = URL.createObjectURL(blob);
      a.download = `creation-${Date.now()}.png`;
      a.click();

      URL.revokeObjectURL(a.href);
      toast.success("Downloaded!");
    } catch (err) {
      toast.error("Failed to download");
    }
  };

  // Clear all
  const clearAll = () => {
    syncStorage([]);
    toast.success("All cleared!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Saved Creations</h2>

      {saved.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No saved creations yet.  
          Generate images and save them from preview screen.
        </p>
      )}

      {saved.length > 0 && (
        <Button
          variant="destructive"
          className="w-full mb-2"
          onClick={clearAll}
        >
          Clear All
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {saved.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg border bg-card space-y-2"
          >
            <img
              src={item.imageUrl}
              className="w-full rounded-lg object-contain bg-black/5"
            />

            {/* CAPTION + TAGS */}
            {(item.caption || item.tags) && (
              <div className="bg-primary/10 border rounded p-2 space-y-1">
                {item.caption && (
                  <p className="text-sm whitespace-pre-line">
                    {item.caption}
                  </p>
                )}
                {item.tags && (
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {item.tags}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => handleDownload(item.imageUrl)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-right">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
