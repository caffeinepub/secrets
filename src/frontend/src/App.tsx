import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, EyeOff, Loader2, Lock, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState, useCallback } from "react";
import { EmptyState } from "./components/EmptyState";
import { SecretCard } from "./components/SecretCard";
import { SecretDetailModal } from "./components/SecretDetailModal";
import { SkeletonCard } from "./components/SkeletonCard";
import { SubmitSecretModal } from "./components/SubmitSecretModal";
import { useGetSecrets } from "./hooks/useQueries";

type FilterType = "all" | "trending" | "recent";

function App() {
  const [filter, setFilter] = useState<FilterType>("recent");
  const [page, setPage] = useState(0n);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [detailId, setDetailId] = useState<bigint | null>(null);

  const {
    data: secrets = [],
    isLoading,
    isFetching,
  } = useGetSecrets(filter, page);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(0n);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1n);
  }, []);

  const openDetail = useCallback((id: bigint) => {
    setDetailId(id);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailId(null);
  }, []);

  const displaySecrets = secrets;

  const hasMore = secrets.length === 20; // assume page size 20

  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" theme="dark" />

      {/* Hero background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(/assets/generated/secrets-hero-bg.dim_1200x800.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
      </div>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <EyeOff className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-xl font-semibold text-gradient-gold tracking-tight">
              Secrets
            </span>
          </motion.div>

          {/* Share CTA */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              onClick={() => setSubmitOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium"
              size="sm"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share a Secret</span>
              <span className="sm:hidden">Share</span>
            </Button>
          </motion.div>
        </div>
      </header>

      {/* ── Hero tagline ────────────────────────────────────────────── */}
      <section className="relative z-10 pt-14 pb-10 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl font-semibold text-foreground/90 leading-tight mb-3"
        >
          Tell your truth,{" "}
          <span className="text-gradient-gold">anonymously.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground/80 text-base sm:text-lg max-w-md mx-auto leading-relaxed"
        >
          A safe space for confessions, thoughts, and secrets you've never said
          out loud.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6"
        >
          <Button
            onClick={() => setSubmitOpen(true)}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium px-8 h-12 text-base shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5" />
            Post Anonymously
          </Button>
        </motion.div>
      </section>

      {/* ── Feed ───────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 pb-16">
        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-8"
        >
          <Tabs
            value={filter}
            onValueChange={(v) => handleFilterChange(v as FilterType)}
          >
            <TabsList className="bg-muted/30 border border-border/40 p-1 h-auto">
              <TabsTrigger
                value="recent"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-5 py-2 rounded-md font-medium text-sm transition-all"
              >
                Recent
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-5 py-2 rounded-md font-medium text-sm transition-all"
              >
                Trending
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-5 py-2 rounded-md font-medium text-sm transition-all"
              >
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Cards grid */}
        <div className="columns-1 sm:columns-2 gap-4 space-y-0">
          {isLoading && page === 0n ? (
            <>
              {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map(
                (id, i) => (
                  <div key={id} className="break-inside-avoid mb-4">
                    <SkeletonCard index={i} />
                  </div>
                ),
              )}
            </>
          ) : displaySecrets.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence mode="wait">
              {displaySecrets.map((secret, i) => (
                <div
                  key={secret.id.toString()}
                  className="break-inside-avoid mb-4"
                >
                  <SecretCard secret={secret} onOpen={openDetail} index={i} />
                </div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Load more */}
        {!isLoading && hasMore && displaySecrets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 flex justify-center"
          >
            <Button
              variant="outline"
              className="border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 gap-2 px-8"
              onClick={handleLoadMore}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Load more secrets
            </Button>
          </motion.div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/30 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/50">
          <span className="flex items-center gap-1.5">
            <EyeOff className="h-3 w-3" />
            All secrets are 100% anonymous
          </span>
          <span>
            © {year}. Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/70 transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <SubmitSecretModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
      />
      <SecretDetailModal secretId={detailId} onClose={closeDetail} />
    </div>
  );
}

export default App;
