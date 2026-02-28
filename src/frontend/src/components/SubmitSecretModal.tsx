import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Lock, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useSubmitSecret, useUploadImage } from "../hooks/useQueries";
import { saveRichPost } from "../utils/richPostStorage";

const CATEGORIES = ["Love", "Work", "Family", "Funny", "Dark", "Random"];
const MAX_CHARS = 500;
const MOOD_EMOJIS = [
  "🔥",
  "💔",
  "😱",
  "🤫",
  "😂",
  "👀",
  "💀",
  "🥺",
  "✨",
  "😈",
];

type BgColor = "" | "rose" | "violet" | "amber" | "cyan" | "emerald";
type FontStyle = "normal" | "display";

const BG_SWATCHES: { value: BgColor; label: string; style: string }[] = [
  { value: "", label: "Default", style: "bg-muted/60 border-border/60" },
  { value: "rose", label: "Rose", style: "bg-rose-600" },
  { value: "violet", label: "Violet", style: "bg-violet-600" },
  { value: "amber", label: "Amber", style: "bg-amber-500" },
  { value: "cyan", label: "Cyan", style: "bg-cyan-500" },
  { value: "emerald", label: "Emerald", style: "bg-emerald-500" },
];

interface SubmitSecretModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubmitSecretModal({ open, onClose }: SubmitSecretModalProps) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [moodEmoji, setMoodEmoji] = useState("");
  const [bgColor, setBgColor] = useState<BgColor>("");
  const [fontStyle, setFontStyle] = useState<FontStyle>("normal");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitMutation = useSubmitSecret();
  const { upload, progress: uploadProgress, isUploading } = useUploadImage();

  const charCount = text.length;
  const charProgress = charCount / MAX_CHARS;
  const charColor =
    charProgress > 0.9
      ? "text-destructive"
      : charProgress > 0.7
        ? "text-[oklch(0.78_0.14_68)]"
        : "text-muted-foreground/60";

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
      toast.error("Please select a jpg, png, gif, or webp image.");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!text.trim() || !category) return;

    let imageUrl = "";

    // Step 1: upload image if present
    if (imageFile) {
      try {
        imageUrl = await upload(imageFile);
      } catch {
        toast.error("Image upload failed — posting without image.");
      }
    }

    // Step 2: submit secret
    submitMutation.mutate(
      { text: text.trim(), category: category.toLowerCase() },
      {
        onSuccess: (id) => {
          // Step 3: save rich data
          saveRichPost(id, {
            imageUrl,
            moodEmoji,
            bgColor,
            fontStyle,
          });
          toast.success("Your secret has been shared anonymously", {
            description: "It will appear in the feed shortly.",
          });
          resetForm();
          onClose();
        },
        onError: () => {
          toast.error("Failed to post your secret", {
            description: "Please try again.",
          });
        },
      },
    );
  };

  const resetForm = () => {
    setText("");
    setCategory("");
    setMoodEmoji("");
    setBgColor("");
    setFontStyle("normal");
    removeImage();
  };

  const handleClose = () => {
    if (!submitMutation.isPending && !isUploading) {
      onClose();
    }
  };

  const isPending = submitMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg w-full bg-card border-border/60 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Share a Secret
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Your identity is completely anonymous. Add a photo and mood to make
            it unforgettable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* ── Image Upload ───────────────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">
              Photo{" "}
              <span className="text-muted-foreground/50 font-normal">
                (optional)
              </span>
            </Label>

            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-xl overflow-hidden group"
                >
                  <img
                    src={imagePreview}
                    alt="Selected"
                    className="w-full max-h-52 object-cover rounded-xl"
                  />
                  {/* Upload progress overlay */}
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-xl"
                      >
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <div className="w-2/3">
                          <Progress value={uploadProgress} className="h-1.5" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {uploadProgress}%
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Remove button */}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:border-destructive/50"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5 text-foreground" />
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    relative rounded-xl border-2 border-dashed transition-all duration-200
                    ${
                      isDragging
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/50"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload photo"
                    className="w-full cursor-pointer hover:bg-muted/10 rounded-xl transition-colors"
                  >
                    <div className="py-8 flex flex-col items-center gap-2.5 text-center px-4">
                      <div className="w-11 h-11 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
                        <ImagePlus className="h-5 w-5 text-muted-foreground/60" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70 font-medium">
                          {isDragging
                            ? "Drop it here!"
                            : "Drag & drop or click to add a photo"}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-0.5">
                          JPG, PNG, GIF, WEBP
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* ── Text area ──────────────────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">
              Your secret
            </Label>
            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Share something you've never told anyone…"
                className={`min-h-[120px] bg-muted/20 border-border/60 text-foreground placeholder:text-muted-foreground/40 resize-none focus-visible:ring-primary/50 focus-visible:border-primary/40 text-[0.95rem] leading-relaxed ${fontStyle === "display" ? "font-display" : ""}`}
              />
              {/* Char counter ring */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <svg
                  className="w-7 h-7 -rotate-90"
                  viewBox="0 0 28 28"
                  aria-hidden="true"
                  role="presentation"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="none"
                    stroke="oklch(0.24 0.01 255)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="none"
                    stroke={
                      charProgress > 0.9
                        ? "oklch(0.65 0.22 25)"
                        : charProgress > 0.7
                          ? "oklch(0.78 0.14 68)"
                          : "oklch(0.78 0.14 68 / 0.6)"
                    }
                    strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 11}`}
                    strokeDashoffset={`${2 * Math.PI * 11 * (1 - charProgress)}`}
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />
                </svg>
                {charProgress > 0.7 && (
                  <span
                    className={`text-xs font-medium tabular-nums ${charColor}`}
                  >
                    {MAX_CHARS - charCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Category ───────────────────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-muted/20 border-border/60 text-foreground focus:ring-primary/50">
                <SelectValue placeholder="Choose a category…" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60">
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat.toLowerCase()}
                    className="text-foreground focus:bg-muted/50 cursor-pointer"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Mood Emoji ─────────────────────────────────────── */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-foreground/80">
              Mood{" "}
              <span className="text-muted-foreground/50 font-normal">
                (optional)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {MOOD_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    setMoodEmoji((prev) => (prev === emoji ? "" : emoji))
                  }
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-150
                    ${
                      moodEmoji === emoji
                        ? "bg-primary/20 ring-2 ring-primary/60 scale-110 shadow-md"
                        : "bg-muted/30 hover:bg-muted/60 hover:scale-105"
                    }
                  `}
                  aria-label={`Select ${emoji} mood`}
                  aria-pressed={moodEmoji === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* ── Card Background ────────────────────────────────── */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-foreground/80">
              Card Background{" "}
              <span className="text-muted-foreground/50 font-normal">
                (optional)
              </span>
            </Label>
            <div className="flex items-center gap-2.5">
              {BG_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() => setBgColor(swatch.value)}
                  className={`
                    w-8 h-8 rounded-full transition-all duration-150 border-2 flex items-center justify-center
                    ${swatch.style}
                    ${
                      bgColor === swatch.value
                        ? "ring-2 ring-offset-2 ring-offset-card ring-primary/70 scale-110 shadow-lg"
                        : "hover:scale-110 border-transparent hover:border-white/20"
                    }
                  `}
                  aria-label={`${swatch.label} background`}
                  aria-pressed={bgColor === swatch.value}
                >
                  {swatch.value === "" && (
                    <span className="text-xs text-muted-foreground/70">✕</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Font Style ─────────────────────────────────────── */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-foreground/80">
              Font Style
            </Label>
            <div className="flex gap-2">
              {(["normal", "display"] as FontStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFontStyle(style)}
                  className={`
                    flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-150 border
                    ${
                      fontStyle === style
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }
                  `}
                  aria-pressed={fontStyle === style}
                >
                  <span className={style === "display" ? "font-display" : ""}>
                    {style === "normal" ? "Normal" : "Handwriting"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Submit ─────────────────────────────────────────── */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium gap-2 h-11 text-base"
              disabled={!text.trim() || !category || isPending}
              onClick={handleSubmit}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploading ? `Uploading… ${uploadProgress}%` : "Posting…"}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Post Anonymously
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground/50">
            By posting, you agree to our community guidelines. Keep it safe and
            kind.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
