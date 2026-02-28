import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, { useState, useCallback } from "react";
import { useReactToSecret } from "../hooks/useQueries";
import type { ReactionCounts } from "../hooks/useQueries";

const REACTIONS = [
  { key: "heart", emoji: "❤️", label: "Heart" },
  { key: "fire", emoji: "🔥", label: "Fire" },
  { key: "wow", emoji: "😮", label: "Wow" },
  { key: "sad", emoji: "😢", label: "Sad" },
] as const;

type ReactionKey = "heart" | "fire" | "wow" | "sad";

interface ReactionBarProps {
  secretId: bigint;
  reactions: ReactionCounts;
  className?: string;
}

export function ReactionBar({
  secretId,
  reactions,
  className,
}: ReactionBarProps) {
  const [localReacted, setLocalReacted] = useState<ReactionKey | null>(null);
  const [localCounts, setLocalCounts] = useState<ReactionCounts>(reactions);
  const [burst, setBurst] = useState<ReactionKey | null>(null);
  const reactMutation = useReactToSecret();

  const handleReact = useCallback(
    (key: ReactionKey) => {
      // Optimistic update
      setLocalCounts((prev) => ({
        ...prev,
        [key]: prev[key] + (localReacted === key ? -1n : 1n),
      }));
      const previous = localReacted;
      setLocalReacted((prev) => (prev === key ? null : key));

      // Reverse previous reaction if switching
      if (previous && previous !== key) {
        setLocalCounts((prev) => ({
          ...prev,
          [previous]: prev[previous] - 1n,
        }));
      }

      setBurst(key);
      setTimeout(() => setBurst(null), 600);

      reactMutation.mutate(
        { id: secretId, reactionType: key },
        {
          onSuccess: (newCounts) => {
            setLocalCounts(newCounts);
          },
          onError: () => {
            // Rollback
            setLocalCounts(reactions);
            setLocalReacted(null);
          },
        },
      );
    },
    [secretId, localReacted, reactMutation, reactions],
  );

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {REACTIONS.map(({ key, emoji, label }) => (
        <button
          type="button"
          key={key}
          onClick={(e) => {
            e.stopPropagation();
            handleReact(key);
          }}
          aria-label={`${label}: ${localCounts[key].toString()} reactions`}
          className={cn(
            "reaction-btn relative",
            localReacted === key && "reacted",
          )}
        >
          <AnimatePresence mode="wait">
            {burst === key ? (
              <motion.span
                key="burst"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1.3, opacity: 1 }}
                exit={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                {emoji}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <span className={cn("text-base", burst === key && "opacity-0")}>
            {emoji}
          </span>
          <span className="tabular-nums font-medium">
            {localCounts[key].toString()}
          </span>
        </button>
      ))}
    </div>
  );
}
