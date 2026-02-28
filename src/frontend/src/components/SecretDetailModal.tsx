import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, MessageCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  useAddComment,
  useGetComments,
  useGetSecret,
} from "../hooks/useQueries";
import { getRichPost } from "../utils/richPostStorage";
import { timeAgo } from "../utils/time";
import { CategoryBadge } from "./CategoryBadge";
import { ReactionBar } from "./ReactionBar";

const BG_TINT_MAP: Record<string, string> = {
  rose: "from-rose-950/30 via-transparent",
  violet: "from-violet-950/30 via-transparent",
  amber: "from-amber-950/30 via-transparent",
  cyan: "from-cyan-950/30 via-transparent",
  emerald: "from-emerald-950/30 via-transparent",
};

interface SecretDetailModalProps {
  secretId: bigint | null;
  onClose: () => void;
}

export function SecretDetailModal({
  secretId,
  onClose,
}: SecretDetailModalProps) {
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const { data: secret, isLoading: secretLoading } = useGetSecret(secretId);
  const { data: comments = [], isLoading: commentsLoading } =
    useGetComments(secretId);
  const addCommentMutation = useAddComment();

  const rich = secretId !== null ? getRichPost(secretId) : null;
  const bgTintClass = rich?.bgColor ? BG_TINT_MAP[rich.bgColor] : null;

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !secretId) return;
    const text = commentText.trim();
    setCommentText("");

    addCommentMutation.mutate(
      { secretId, text },
      {
        onSuccess: () => {
          toast.success("Comment posted anonymously");
        },
        onError: () => {
          setCommentText(text);
          toast.error("Failed to post comment");
        },
      },
    );
  };

  // Focus comment input when modal opens
  useEffect(() => {
    if (secretId && !secretLoading) {
      setTimeout(() => commentInputRef.current?.focus(), 200);
    }
  }, [secretId, secretLoading]);

  return (
    <Dialog
      open={secretId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-2xl w-full bg-card border-border/60 shadow-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Background tint */}
        {bgTintClass && (
          <div
            className={`absolute inset-0 bg-gradient-to-b ${bgTintClass} pointer-events-none z-0`}
            aria-hidden
          />
        )}

        <DialogHeader className="relative z-10 p-6 pb-4 shrink-0">
          <DialogTitle className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
            Secret
            {rich?.moodEmoji && (
              <span className="text-2xl leading-none" aria-hidden>
                {rich.moodEmoji}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 relative z-10">
          <div className="px-6 pb-6 space-y-6">
            {/* Secret content */}
            {secretLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full bg-muted/60" />
                <Skeleton className="h-5 w-11/12 bg-muted/60" />
                <Skeleton className="h-5 w-3/4 bg-muted/60" />
              </div>
            ) : secret ? (
              <div className="space-y-4">
                {/* Post image */}
                {rich?.imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-xl overflow-hidden -mx-0"
                  >
                    <img
                      src={rich.imageUrl}
                      alt=""
                      className="w-full max-h-[300px] object-contain bg-muted/20 rounded-xl"
                    />
                  </motion.div>
                )}

                {/* Quote */}
                <div
                  className="font-display text-6xl leading-none text-primary/20 select-none"
                  aria-hidden
                >
                  "
                </div>

                <p
                  className={`text-base leading-relaxed text-foreground/90 whitespace-pre-wrap ${rich?.fontStyle === "display" ? "font-display" : ""}`}
                >
                  {secret.text}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <CategoryBadge category={secret.category} />
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {timeAgo(secret.timestamp)}
                  </span>
                </div>

                <ReactionBar
                  secretId={secret.id}
                  reactions={secret.reactions}
                />
              </div>
            ) : null}

            <Separator className="bg-border/60" />

            {/* Comments section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {comments.length}{" "}
                  {comments.length === 1 ? "Reply" : "Replies"}
                </h3>
              </div>

              {commentsLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full bg-muted/60" />
                      <Skeleton className="h-4 w-2/3 bg-muted/60" />
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No replies yet. Be the first to respond.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-3">
                    {comments.map((comment, i) => (
                      <motion.div
                        key={comment.id.toString()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-lg bg-muted/30 border border-border/40 p-4"
                      >
                        <p className="text-sm leading-relaxed text-foreground/85">
                          {comment.text}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {timeAgo(comment.timestamp)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* Comment form */}
            <div className="space-y-3 pt-2">
              <Textarea
                ref={commentInputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add an anonymous reply…"
                className="min-h-[80px] bg-muted/20 border-border/60 text-foreground placeholder:text-muted-foreground/50 resize-none focus-visible:ring-primary/50 focus-visible:border-primary/40"
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) {
                    handleSubmitComment();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60">
                  {commentText.length}/500 · ⌘Enter to post
                </span>
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Post Anonymously
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
