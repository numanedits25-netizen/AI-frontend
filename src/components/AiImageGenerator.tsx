// AiImageGenerator.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Canvas, FabricImage } from "fabric";
import { Sparkles, Loader2 } from "lucide-react";
import PreviewModal from "./PreviewModal";

interface AiImageGeneratorProps {
  canvasRef: Canvas | null;
}

type AspectRatio = "16:9" | "1:1" | "9:16" | "4:5";

// 🔥 Your backend URL here
const API_BASE = import.meta.env.VITE_API_URL;

const AiImageGenerator = ({ canvasRef }: AiImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState("");
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [captionText, setCaptionText] = useState("");

  const ratioSizes = {
    "16:9": { width: 1280, height: 720 },
    "1:1": { width: 1024, height: 1024 },
    "9:16": { width: 720, height: 1280 },
    "4:5": { width: 1024, height: 1280 },
  };

  // ---------------- IMAGE UPLOAD ----------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReferenceFile(file);
    const url = URL.createObjectURL(file);
    setReferencePreview(url);

    toast.success("Reference image attached!");
  };

  // ---------------- GENERATE IMAGE ----------------
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt!");
      return;
    }

    if (!canvasRef) {
      toast.error("Canvas not ready");
      return;
    }

    setIsGenerating(true);
    setShowPreview(true);

    try {
      const size = ratioSizes[selectedRatio];
      const fullPrompt = `${prompt}. Make it ${selectedRatio}, professional & centered.`;

      const form = new FormData();
      form.append("prompt", fullPrompt);
      form.append("aspectRatio", selectedRatio);

      if (referenceFile) {
        form.append("referenceImage", referenceFile);
      }

      const res = await fetch(`${API_BASE}/api/generate-image`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        toast.error("Image generation failed.");
        setShowPreview(false);
        return;
      }

      const data = await res.json();

      if (!data.imageUrl) {
        toast.error("No image returned!");
        setShowPreview(false);
        return;
      }

      const finalImage = data.imageUrl;
      setGeneratedImage(finalImage);

      // Render to Fabric Canvas
      canvasRef.setDimensions(size);

      FabricImage.fromURL(finalImage, { crossOrigin: "anonymous" }).then(img => {
        canvasRef.clear();

        const scale = Math.max(
          size.width / (img.width || 1),
          size.height / (img.height || 1)
        );

        img.scale(scale);
        img.set({
          left: size.width / 2,
          top: size.height / 2,
          originX: "center",
          originY: "center",
        });

        // @ts-ignore
        canvasRef.backgroundImage = img;
        canvasRef.renderAll();
      });

      toast.success("Image generated!");
    } catch (err) {
      toast.error("Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------------- CAPTION ----------------
  const handleGenerateCaption = async () => {
    if (!generatedImage) {
      toast.error("Generate an image first!");
      return;
    }

    setIsGeneratingCaption(true);

    try {
      const form = new FormData();
      form.append("imageUrl", generatedImage);
      form.append("prompt", prompt);

      const res = await fetch(`${API_BASE}/api/generate-caption`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        toast.error("Caption failed.");
        return;
      }

      const data = await res.json();
      const caption = data.caption || "No caption generated.";
      const tags = data.tags || "";

      setCaptionText(`${caption}\n\n${tags}`);
      toast.success("Caption ready!");
    } catch {
      toast.error("Caption error");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleCopyCaption = async () => {
    if (!captionText) return;
    await navigator.clipboard.writeText(captionText);
    toast.success("Copied!");
  };

  // ---------------- UI ----------------
  return (
    <div className="space-y-4">
      <Label>Describe Image</Label>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A futuristic neon Tokyo street at night..."
        className="min-h-[100px]"
      />

      <Label>Aspect Ratio</Label>
      <Select
        value={selectedRatio}
        onValueChange={(val) => setSelectedRatio(val as AspectRatio)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select ratio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="16:9">16:9 Landscape</SelectItem>
          <SelectItem value="1:1">1:1 Square</SelectItem>
          <SelectItem value="9:16">9:16 Vertical</SelectItem>
          <SelectItem value="4:5">4:5 Portrait</SelectItem>
        </SelectContent>
      </Select>

      <Label>Reference Image (optional)</Label>
      <Input type="file" accept="image/*" onChange={handleImageUpload} />

      {referencePreview && (
        <img
          src={referencePreview}
          className="w-full h-28 object-contain rounded border mt-2"
        />
      )}

      <Button
        className="w-full bg-gradient-primary"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Image
          </>
        )}
      </Button>

      {generatedImage && (
        <Button
          className="w-full bg-purple-600 text-white"
          onClick={handleGenerateCaption}
          disabled={isGeneratingCaption}
        >
          {isGeneratingCaption ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Caption...
            </>
          ) : (
            <>✨ Viral Caption</>
          )}
        </Button>
      )}

      {captionText && (
        <div className="space-y-2">
          <div className="p-4 border rounded bg-primary/10 whitespace-pre-line">
            {captionText}
          </div>
          <Button onClick={handleCopyCaption} variant="outline">
            Copy Caption
          </Button>
        </div>
      )}

      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        imageUrl={generatedImage}
        isLoading={isGenerating}
        onRetry={handleGenerate}
      />
    </div>
  );
};

export default AiImageGenerator;
