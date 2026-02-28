# Secrets — Rich Post Creation

## Current State
- Users can submit a secret with plain text (up to 500 chars) and a category.
- Secret cards display only text, reactions, and comment count.
- Backend stores: text, category, timestamp, reactions, commentCount.
- No media attachment support exists.

## Requested Changes (Diff)

### Add
- **Image attachment** on posts: users can upload 1 photo per secret (optional). Shown prominently at the top of the card (full-width, rounded, with lazy loading).
- **Emoji/mood sticker picker**: a row of mood stickers / emoji the user can pick from when composing (stored as a string, e.g. "🔥", "💔", "😱"). Displayed as a large floating badge on the card.
- **Background color / gradient picker**: user can choose a card background accent (stored as a color key string). Cards render with that tinted gradient overlay.
- **Font style toggle**: user can switch the post font between "normal" and "handwriting" display style. Stored as a fontStyle field ("normal" | "display").
- **Rich post composer** — upgraded SubmitSecretModal with tabs/sections for: Text, Photo, Mood, Style.

### Modify
- **Backend `Secret` type**: add optional fields `imageUrl`, `moodEmoji`, `bgColor`, `fontStyle`.
- **Backend `SecretPreview` type**: expose `imageUrl`, `moodEmoji`, `bgColor`, `fontStyle` so feed cards can render them.
- **`submitSecret`**: accept new parameters `imageUrl`, `moodEmoji`, `bgColor`, `fontStyle`.
- **SecretCard**: render image (if present) at the top, mood emoji badge, tinted background, and font style.
- **SecretDetailModal**: show full image with zoom, mood emoji, bg accent.

### Remove
- Nothing removed.

## Implementation Plan
1. Select `blob-storage` Caffeine component for image upload.
2. Regenerate Motoko backend with updated `Secret`/`SecretPreview` types and new `submitSecret` signature.
3. Update `SubmitSecretModal` into a rich composer with: image upload area (drag-and-drop + tap), emoji mood row, background color palette, font style toggle.
4. Update `SecretCard` to: show uploaded image, mood emoji floating badge, tinted card bg, correct font class.
5. Update `SecretDetailModal` similarly with full-size image.
6. Wire blob-storage upload hook for the image field before calling `submitSecret`.
