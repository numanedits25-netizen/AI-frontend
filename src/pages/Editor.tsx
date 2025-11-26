import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast as sonnerToast } from "sonner";
import { FabricImage } from "fabric";
import ThumbnailCanvas from "@/components/ThumbnailCanvas";
import BackgroundSelector from "@/components/BackgroundSelector";
import TextEditor from "@/components/TextEditor";
import AiInfluencers from "@/components/AiInfluencers";
import AiImageGenerator from "@/components/AiImageGenerator";
import SavedCreations from "@/components/SavedCreations";
import SystemUpgradeComplete from "@/components/SystemUpgradeComplete";
import EditorNavigation from "@/components/EditorNavigation";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { saveToLocalStorage, getLatestCreation, clearLocalStorage } from "@/lib/autoSave";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Editor = () => {
  const [canvasRef, setCanvasRef] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sourceThumbnailUrl, setSourceThumbnailUrl] = useState<string>("");
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("ai-influencers");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showUpgradeComplete, setShowUpgradeComplete] = useState(false);
  const navigate = useNavigate();

  // Show upgrade complete modal on first load
  useEffect(() => {
    const hasSeenUpgrade = sessionStorage.getItem("hasSeenUpgrade");
    if (!hasSeenUpgrade) {
      setShowUpgradeComplete(true);
      sessionStorage.setItem("hasSeenUpgrade", "true");
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Auto-restore on mount without dialog
  useEffect(() => {
    if (canvasRef && !loading) {
      const latest = getLatestCreation();
      if (latest) {
        // Automatically restore without showing dialog
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          FabricImage.fromURL(latest.imageUrl, { crossOrigin: 'anonymous' }).then((fabricImg) => {
            canvasRef.clear();
            fabricImg.scaleToWidth(canvasRef.width!);
            fabricImg.scaleToHeight(canvasRef.height!);
            canvasRef.backgroundImage = fabricImg;
            canvasRef.renderAll();
          });
        };
        img.src = latest.imageUrl;
      }
    }
  }, [canvasRef, loading]);

  // Auto-save on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && canvasRef) {
        // Auto-save when tab becomes hidden
        const dataURL = canvasRef.toDataURL({ format: 'png', quality: 1.0 });
        saveToLocalStorage({
          imageUrl: dataURL,
          prompt: lastGeneratedUrl ? 'AI Generated' : 'Manual Creation',
          type: sourceThumbnailUrl ? 'youtube' : 'background',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [canvasRef, lastGeneratedUrl, sourceThumbnailUrl]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleYouTubeThumbnailFetched = (thumbnailUrl: string) => {
    setSourceThumbnailUrl(thumbnailUrl);
    sonnerToast.success("✅ Thumbnail fetched successfully");
  };

  const handleAiGenerated = (imageUrl: string) => {
    setLastGeneratedUrl(imageUrl);
    
    // Auto-save to localStorage
    if (canvasRef) {
      const dataURL = canvasRef.toDataURL({ format: 'png', quality: 1.0 });
      saveToLocalStorage({
        imageUrl: dataURL,
        prompt: 'AI Generated',
        type: sourceThumbnailUrl ? 'youtube' : 'ai-image',
      });
    }
  };


  const handleClearHistory = () => {
    clearLocalStorage();
    sonnerToast.success("History cleared!");
    setShowClearDialog(false);
  };

  const handleSaveThumbnail = async () => {
    if (!session || !canvasRef) {
      sonnerToast.error("Canvas not ready");
      return;
    }

    setIsSaving(true);
    try {
      const dataURL = canvasRef.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1,
      });

      const response = await fetch(dataURL);
      const blob = await response.blob();
      const fileName = `${session.user.id}/${Date.now()}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('saved_thumbnails')
        .insert([{
          user_id: session.user.id,
          thumbnail_url: publicUrl,
          source_type: sourceThumbnailUrl ? 'youtube' : 'template',
          source_data: sourceThumbnailUrl ? { url: sourceThumbnailUrl } : null,
          prompt: lastGeneratedUrl ? 'AI Generated' : 'Manual Creation',
          settings: {},
        }]);

      if (dbError) throw dbError;

      // Also save to localStorage
      saveToLocalStorage({
        imageUrl: dataURL,
        prompt: lastGeneratedUrl ? 'AI Generated' : 'Manual Creation',
        type: sourceThumbnailUrl ? 'youtube' : 'background',
      });

      sonnerToast.success("Thumbnail saved successfully!");
      setActiveTab("saved");
    } catch (error) {
      console.error('Error saving thumbnail:', error);
      sonnerToast.error("Failed to save thumbnail");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EditorNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-8">
          {activeTab === "ai-influencers" && (
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-8">
              {/* Mobile: Preview First */}
              <div className="lg:hidden space-y-4">
                <div className="bg-card rounded-xl p-4 shadow-card border border-border">
                  <h3 className="text-lg font-semibold mb-3">Preview</h3>
                  <ThumbnailCanvas onCanvasReady={setCanvasRef} />
                </div>
              </div>

              {/* Controls */}
              <div className="bg-card rounded-xl p-4 md:p-6 shadow-card border border-border">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">AI Influencers</h2>
                <AiInfluencers canvasRef={canvasRef} />
              </div>

              {/* Desktop: Preview on Right */}
              <div className="hidden lg:block space-y-4">
                <div className="bg-card rounded-xl p-6 shadow-card border border-border sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <Button
                      onClick={handleSaveThumbnail}
                      disabled={isSaving}
                      className="bg-gradient-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <ThumbnailCanvas onCanvasReady={setCanvasRef} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-image" && (
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-8">
              {/* Mobile: Preview First */}
              <div className="lg:hidden space-y-4">
                <div className="bg-card rounded-xl p-4 shadow-card border border-border">
                  <h3 className="text-lg font-semibold mb-3">Preview</h3>
                  <ThumbnailCanvas onCanvasReady={setCanvasRef} />
                </div>
              </div>

              {/* Controls */}
              <div className="bg-card rounded-xl p-4 md:p-6 shadow-card border border-border">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">AI Image Generator</h2>
                <AiImageGenerator canvasRef={canvasRef} />
              </div>

              {/* Desktop: Preview on Right */}
              <div className="hidden lg:block space-y-4">
                <div className="bg-card rounded-xl p-6 shadow-card border border-border sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <Button
                      onClick={handleSaveThumbnail}
                      disabled={isSaving}
                      className="bg-gradient-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <ThumbnailCanvas onCanvasReady={setCanvasRef} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="bg-card rounded-xl p-4 md:p-6 shadow-card border border-border">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Saved Creations</h2>
              <SavedCreations session={session} />
            </div>
          )}
        </div>
      </main>

      <SystemUpgradeComplete 
        open={showUpgradeComplete} 
        onClose={() => setShowUpgradeComplete(false)}
        autoRun={true}
      />

      {/* Mobile/Tablet Sticky Bottom Bar */}
      {activeTab !== "saved" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elegant z-50">
          <div className="flex items-center justify-around p-3 gap-2">
            <Button
              onClick={() => setShowClearDialog(true)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={handleSaveThumbnail}
              disabled={isSaving}
              className="flex-1 bg-gradient-primary"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}

      {/* Clear History Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all locally saved creations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Editor;
