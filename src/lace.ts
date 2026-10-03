export type Hand = "down" | "held";
export type Bow = "loose" | "tied";

export type LaceState = {
  left: Hand;
  right: Hand;
  bow: Bow;
};

export const EMPTY_LACE: LaceState = { left: "down", right: "down", bow: "loose" };

export function laceLine(state: LaceState): string {
  if (state.bow === "tied") return "The bow is tied.";
  const hands = (state.left === "held" ? 1 : 0) + (state.right === "held" ? 1 : 0);
  if (hands === 0) return "The lace is loose.";
  if (hands === 1) return "One hand is holding.";
  return "Ready to tie.";
}

export function laceStatus(state: LaceState): string {
  if (state.bow === "tied") return "The bow holds.";
  if (state.left === "held" && state.right === "held") return "Both hands ready.";
  if (state.left === "held") return "Left hand only.";
  if (state.right === "held") return "Right hand only.";
  return "Hands are down.";
}

export function hasProgress(state: LaceState): boolean {
  return state.bow === "tied" || state.left === "held" || state.right === "held";
}

function isHand(value: unknown): value is Hand {
  return value === "down" || value === "held";
}

export function parseLace(raw: string | null): LaceState {
  if (!raw) return EMPTY_LACE;
  try {
    const value = JSON.parse(raw) as { left?: unknown; right?: unknown; bow?: unknown };
    if (!isHand(value.left) || !isHand(value.right)) return EMPTY_LACE;
    if (value.bow !== "loose" && value.bow !== "tied") return EMPTY_LACE;
    if (value.bow === "tied" && (value.left !== "held" || value.right !== "held")) return EMPTY_LACE;
    return { left: value.left, right: value.right, bow: value.bow };
  } catch {
    return EMPTY_LACE;
  }
}

export function holdHand(state: LaceState, side: "left" | "right"): { state: LaceState; note: string } {
  if (state.bow === "tied") return { state, note: "Untie first." };
  if (state[side] === "held") return { state, note: "Already on." };
  const next = { ...state, [side]: "held" as const };
  return { state: next, note: side === "left" ? "Left hand on." : "Right hand on." };
}

export function dropHand(state: LaceState, side: "left" | "right"): { state: LaceState; note: string } {
  if (state.bow === "tied") return { state, note: "Untie first." };
  if (state[side] === "down") return { state, note: "Already off." };
  const next = { ...state, [side]: "down" as const };
  return { state: next, note: side === "left" ? "Left hand off." : "Right hand off." };
}

export function tieBow(state: LaceState): { state: LaceState; note: string } {
  if (state.bow === "tied") return { state, note: "Already tied." };
  if (state.left !== "held" || state.right !== "held") return { state, note: "Both hands first." };
  return { state: { left: "held", right: "held", bow: "tied" }, note: "Bow tied." };
}

export function untieBow(state: LaceState): { state: LaceState; note: string } {
  if (state.bow === "loose") return { state, note: "Already loose." };
  return { state: { left: "held", right: "held", bow: "loose" }, note: "Bow untied." };
}

export function resetLace(): { state: LaceState; note: string } {
  return { state: EMPTY_LACE, note: "Look at the lace." };
}
