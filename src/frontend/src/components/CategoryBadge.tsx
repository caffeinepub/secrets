import { cn } from "@/lib/utils";
import React from "react";

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  love: {
    label: "Love",
    className:
      "bg-[oklch(0.65_0.2_10/0.18)] text-[oklch(0.82_0.18_15)] border-[oklch(0.65_0.2_10/0.3)]",
  },
  work: {
    label: "Work",
    className:
      "bg-[oklch(0.65_0.15_250/0.18)] text-[oklch(0.78_0.14_250)] border-[oklch(0.65_0.15_250/0.3)]",
  },
  family: {
    label: "Family",
    className:
      "bg-[oklch(0.65_0.15_140/0.18)] text-[oklch(0.76_0.14_140)] border-[oklch(0.65_0.15_140/0.3)]",
  },
  funny: {
    label: "Funny",
    className:
      "bg-[oklch(0.72_0.16_80/0.18)] text-[oklch(0.84_0.15_75)] border-[oklch(0.72_0.16_80/0.3)]",
  },
  dark: {
    label: "Dark",
    className:
      "bg-[oklch(0.42_0.08_280/0.25)] text-[oklch(0.68_0.1_280)] border-[oklch(0.42_0.08_280/0.4)]",
  },
  random: {
    label: "Random",
    className:
      "bg-[oklch(0.62_0.14_200/0.18)] text-[oklch(0.76_0.13_200)] border-[oklch(0.62_0.14_200/0.3)]",
  },
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const normalized = category.toLowerCase();
  const style = CATEGORY_STYLES[normalized] ?? {
    label: category,
    className:
      "bg-[oklch(0.22_0.01_255/0.5)] text-[oklch(0.65_0.01_255)] border-[oklch(0.3_0.01_255)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
