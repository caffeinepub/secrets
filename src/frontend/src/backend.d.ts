import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SecretPreview {
    id: bigint;
    text: string;
    commentCount: bigint;
    reactions: ReactionCounts;
}
export interface Secret {
    id: bigint;
    text: string;
    timestamp: bigint;
    commentCount: bigint;
    category: string;
    reactions: ReactionCounts;
}
export interface Comment {
    id: bigint;
    text: string;
    secretId: bigint;
    timestamp: bigint;
}
export interface ReactionCounts {
    sad: bigint;
    wow: bigint;
    heart: bigint;
    fire: bigint;
}
export interface backendInterface {
    addComment(secretId: bigint, text: string, timestamp: bigint): Promise<bigint>;
    getComments(secretId: bigint): Promise<Array<Comment>>;
    getSecret(id: bigint): Promise<Secret>;
    getSecrets(filter: string, page: bigint): Promise<Array<SecretPreview>>;
    reactToSecret(id: bigint, reactionType: string): Promise<ReactionCounts>;
    submitSecret(text: string, category: string, timestamp: bigint): Promise<bigint>;
}
