import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import type { SecretPreview } from "../hooks/useQueries";
import { getRichPost } from "../utils/richPostStorage";
import { ReactionBar } from "./ReactionBar";

const MAX_CHARS = 240;

const BG_TINT_MAP: Record<string, string> = {
  rose: "from-rose-950/30 via-transparent",
  violet: "from-violet-950/30 via-transparent",
  amber: "from-amber-950/30 via-transparent",
  cyan: "from-cyan-950/30 via-transparent",
  emerald: "from-emerald-950/30 via-transparent",
};

interface SecretCardProps {
  secret: SecretPreview;
  onOpen: (id: bigint) => void;
  index: number;
}

export function SecretCard({ secret, onOpen, index }: SecretCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rich = getRichPost(secret.id);
  const isLong = secret.text.length > MAX_CHARS;
  const displayText =
    isLong && !expanded ? `${secret.text.slice(0, MAX_CHARS)}…` : secret.text;

  const bgTintClass = rich?.bgColor ? BG_TINT_MAP[rich.bgColor] : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="card-glow card-glow-hover rounded-xl bg-card overflow-hidden relative"
    >
      {/* Background tint gradient */}
      {bgTintClass && (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${bgTintClass} pointer-events-none z-0 rounded-xl`}
          aria-hidden
        />
      )}

      {/* Card image */}
      {rich?.imageUrl && (
        <button
          type="button"
          className="relative z-10 w-full block"
          onClick={() => onOpen(secret.id)}
          aria-label="Open full secret"
          tabIndex={-1}
        >
          <img
            src={rich.imageUrl}
            alt=""
            className="w-full max-h-[200px] object-cover rounded-t-xl"
            loading="lazy"
          />
        </button>
      )}

      {/* Mood emoji badge */}
      {rich?.moodEmoji && (
        <div
          className="absolute top-2.5 right-2.5 z-20 text-2xl leading-none select-none drop-shadow-lg"
          aria-hidden
        >
          {rich.moodEmoji}
        </div>
      )}

      <div className="relative z-10 p-5">
        {/* Quote mark decoration */}
        <div
          className="font-display text-5xl leading-none mb-2 text-primary/20 select-none"
          aria-hidden="true"
        >
          "
        </div>

        {/* Secret text — clickable to open detail */}
        <button
          type="button"
          className="w-full text-left"
          onClick={() => onOpen(secret.id)}
          aria-label="Open full secret"
        >
          <p
            className={`text-[0.95rem] leading-relaxed text-card-foreground/90 mb-1 hover:text-card-foreground transition-colors ${rich?.fontStyle === "display" ? "font-display" : ""}`}
          >
            {displayText}
          </p>
        </button>

        {/* Expand/collapse */}
        {isLong && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3 mt-1"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> Read more
              </>
            )}
          </button>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-border/60">
          <ReactionBar
            secretId={secret.id}
            reactions={secret.reactions}
            className="flex-1"
          />

          {/* Comment count */}
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors shrink-0"
            onClick={() => onOpen(secret.id)}
            aria-label={`${secret.commentCount.toString()} comments — click to view`}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="tabular-nums">
              {secret.commentCount.toString()}
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
