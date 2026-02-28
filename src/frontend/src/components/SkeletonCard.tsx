import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import React from "react";

interface SkeletonCardProps {
  index?: number;
}

export function SkeletonCard({ index = 0 }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl bg-card card-glow p-5 space-y-3"
    >
      {/* Quote decoration */}
      <Skeleton className="h-7 w-7 rounded-md bg-muted/60" />

      {/* Text lines */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-muted/60" />
        <Skeleton className="h-4 w-11/12 bg-muted/60" />
        <Skeleton className="h-4 w-4/5 bg-muted/60" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-14 rounded-full bg-muted/60" />
          <Skeleton className="h-7 w-14 rounded-full bg-muted/60" />
          <Skeleton className="h-7 w-14 rounded-full bg-muted/60" />
          <Skeleton className="h-7 w-14 rounded-full bg-muted/60" />
        </div>
        <Skeleton className="h-5 w-10 bg-muted/60" />
      </div>
    </motion.div>
  );
}
