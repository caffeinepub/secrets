import { HttpAgent } from "@icp-sdk/core/agent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type {
  Comment,
  ReactionCounts,
  Secret,
  SecretPreview,
} from "../backend.d.ts";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useActor } from "./useActor";

export type { SecretPreview, Secret, Comment, ReactionCounts };

// ── Fetch secrets feed ──────────────────────────────────────────────────────
export function useGetSecrets(filter: string, page: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<SecretPreview[]>({
    queryKey: ["secrets", filter, page.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSecrets(filter, page);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Fetch single secret ─────────────────────────────────────────────────────
export function useGetSecret(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Secret | null>({
    queryKey: ["secret", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getSecret(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ── Fetch comments ──────────────────────────────────────────────────────────
export function useGetComments(secretId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", secretId?.toString()],
    queryFn: async () => {
      if (!actor || secretId === null) return [];
      return actor.getComments(secretId);
    },
    enabled: !!actor && !isFetching && secretId !== null,
  });
}

// ── Submit secret mutation ──────────────────────────────────────────────────
export function useSubmitSecret() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      category,
    }: {
      text: string;
      category: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitSecret(text, category, BigInt(Date.now()));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets"] });
    },
  });
}

// ── React to secret mutation ────────────────────────────────────────────────
export function useReactToSecret() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reactionType,
    }: {
      id: bigint;
      reactionType: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.reactToSecret(id, reactionType);
    },
    onSuccess: (newReactions, { id }) => {
      // Update secrets feed cache
      queryClient.setQueriesData<SecretPreview[]>(
        { queryKey: ["secrets"] },
        (old) =>
          old?.map((s) =>
            s.id === id ? { ...s, reactions: newReactions } : s,
          ) ?? [],
      );
      // Update single secret cache
      queryClient.setQueryData<Secret>(["secret", id.toString()], (old) =>
        old ? { ...old, reactions: newReactions } : old,
      );
    },
  });
}

// ── Upload image via StorageClient ──────────────────────────────────────────
export function useUploadImage() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setProgress(pct);
      });
      const url = await storageClient.getDirectURL(hash);
      return url;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, progress, isUploading };
}

// ── Add comment mutation ────────────────────────────────────────────────────
export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      secretId,
      text,
    }: {
      secretId: bigint;
      text: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addComment(secretId, text, BigInt(Date.now()));
    },
    onSuccess: (_, { secretId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", secretId.toString()],
      });
      // Update comment count in feed
      queryClient.setQueriesData<SecretPreview[]>(
        { queryKey: ["secrets"] },
        (old) =>
          old?.map((s) =>
            s.id === secretId ? { ...s, commentCount: s.commentCount + 1n } : s,
          ) ?? [],
      );
      // Update in single secret
      queryClient.setQueryData<Secret>(
        ["secret", secretId.toString()],
        (old) => (old ? { ...old, commentCount: old.commentCount + 1n } : old),
      );
    },
  });
}
