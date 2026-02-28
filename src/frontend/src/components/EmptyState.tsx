import { motion } from "motion/react";
import React from "react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-full flex flex-col items-center justify-center py-24 px-8 text-center"
    >
      {/* Decorative quote mark */}
      <div
        className="font-display text-[8rem] leading-none text-primary/10 select-none mb-4"
        aria-hidden
      >
        "
      </div>
      <h3 className="font-display text-2xl font-semibold text-foreground/60 mb-2">
        No secrets yet
      </h3>
      <p className="text-muted-foreground/60 text-sm max-w-xs leading-relaxed">
        Be the first to share something you've never told anyone. Your secret is
        safe here.
      </p>
    </motion.div>
  );
}
