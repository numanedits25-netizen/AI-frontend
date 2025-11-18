// AiInfluencers.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { FabricImage, Canvas } from "fabric";

interface AiInfluencersProps {
  canvasRef: Canvas | null;
}

type SeoContent = { caption: string; tags: string } | null;

// 🔥 Backend URL
const API_BASE = import.meta.env.VITE_API_URL;

export default function AiInfluencers({ canvasRef }: AiInfluencersProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState("");
  const [thumbnailSeoContent, setThumbnailSeoContent] = useState<SeoContent[]>([
    null,
    null,
    null,
  ]);
  const [generatingForIndex, setGeneratingForIndex] = useState<number | null>(
    null
  );

  // ------------------- Upload Reference -------------------
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReferenceFile(file);
    const url = URL.createObjectURL(file);
    setReferencePreview(url);

    toast.success("Reference uploaded — will generate variations");
  };

  const handleRemoveReference = () => {
    setReferenceFile(null);
    setReferencePreview("");
    toast.success("Reference removed");
  };

  // ------------------- Generate Influencers -------------------
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Enter a description");
      return;
    }

    setIsGenerating(true);
    setGeneratedOptions([]);
    setThumbnailSeoContent([null, null, null]);

    try {
      const form = new FormData();
      form.append("prompt", aiPrompt);
      form.append("aspectRatio", "4:5");

      if (referenceFile) form.append("referenceImage", referenceFile);

      const res = await fetch(`${API_BASE}/api/generate-influencers`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        toast.error("Failed to generate");
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.imageUrls)) {
        setGeneratedOptions(data.imageUrls);
        toast.success("Generated 3 influencers!");
      } else {
        toast.error("Unexpected response");
      }
    } catch (err) {
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // ------------------- Viral Caption -------------------
  const handleGenerateInfluencerSeo = async (
    imageUrl: string,
    index: number
  ) => {
    setGeneratingForIndex(index);

    try {
      const form = new FormData();
      form.append("imageUrl", imageUrl);
      form.append("prompt", aiPrompt || "");

      const res = await fetch(`${API_BASE}/api/generate-caption`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        toast.error("Caption failed");
        return;
      }

      const json = await res.json();
      const caption = json.caption || "";
      const tags = json.tags || "";

      const newSeo = [...thumbnailSeoContent];
      newSeo[index] = { caption, tags };
      setThumbnailSeoContent(newSeo);

      toast.success("Caption ready!");
    } catch {
      toast.error("SEO failed");
    } finally {
      setGeneratingForIndex(null);
    }
  };

  // ------------------- Apply Image to Canvas -------------------
  const handleSelectOption = (imageUrl: string) => {
    if (!canvasRef) return;

    FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" }).then(
      (img: any) => {
        canvasRef.clear();

        const canvasWidth = canvasRef.width || 1080;
        const canvasHeight = canvasRef.height || 1350;

        const scaleX = canvasWidth / (img.width || 1);
        const scaleY = canvasHeight / (img.height || 1);
        const scale = Math.min(scaleX, scaleY);

        img.scale(scale);
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: "center",
          originY: "center",
          selectable: false,
        });

        // @ts-ignore
        canvasRef.backgroundImage = img;
        canvasRef.renderAll();

        toast.success("Applied to canvas!");
      }
    );
  };

  // ------------------- Upload Custom Image -------------------
  const handleImageUpload2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvasRef) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((img: any) => {
      const width = canvasRef.width || 1080;
      const height = canvasRef.height || 1350;

      const scale = Math.min(
        width / (img.width || 1),
        height / (img.height || 1)
      );

      img.scale(scale);
      img.set({
        left: width / 2,
        top: height / 2,
        originX: "center",
        originY: "center",
      });

      // @ts-ignore
      canvasRef.backgroundImage = img;
      canvasRef.renderAll();

      toast.success("Custom image applied!");
    });
  };

  // ------------------- UI -------------------
  return (
    <div className="space-y-4">
      <Label>Reference Image (optional)</Label>
      <Input type="file" accept="image/*" onChange={handleReferenceUpload} />

      {referencePreview && (
        <div className="relative mt-2">
          <img
            src={referencePreview}
            className="w-full h-32 object-contain rounded border bg-black/5"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={handleRemoveReference}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Label>Influencer Style Prompt</Label>
      <Textarea
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        placeholder="Describe the influencer style..."
        rows={3}
      />

      <Button
        className="w-full bg-gradient-primary"
        onClick={handleAIGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" /> Generate 3 Influencers
          </>
        )}
      </Button>

      {/* --- Results --- */}
      {generatedOptions.length > 0 && (
        <div className="space-y-4 mt-4">
          <Label>Choose Your Favorite</Label>

          {generatedOptions.map((url, index) => (
            <div key={index} className="space-y-2">
              <button
                className="relative w-full aspect-[4/5] rounded-lg border overflow-hidden group"
                onClick={() => handleSelectOption(url)}
              >
                <img
                  src={url}
                  className="w-full h-full object-cover bg-black"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-white text-center mt-24 font-semibold">
                    Select Image {index + 1}
                  </p>
                </div>
              </button>

              <Button
                className="w-full bg-purple-600 text-white"
                onClick={() => handleGenerateInfluencerSeo(url, index)}
                disabled={generatingForIndex === index}
              >
                {generatingForIndex === index ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating
                    Caption...
                  </>
                ) : (
                  <>✨ Viral Caption</>
                )}
              </Button>

              {thumbnailSeoContent[index] && (
                <div className="p-4 border rounded bg-primary/10 space-y-1">
                  <p className="text-sm whitespace-pre-line">
                    {thumbnailSeoContent[index]?.caption}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {thumbnailSeoContent[index]?.tags}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload custom image */}
      <div>
        <Label>Upload Custom Image</Label>
        <Input type="file" accept="image/*" onChange={handleImageUpload2} />
      </div>
    </div>
  );
}
