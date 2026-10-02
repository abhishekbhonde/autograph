// A short starter list. Add more with BLOCKED_WORDS in .env.
// Note: simple word filters give false positives. Keep the list short
// and review what gets blocked.
const DEFAULT_WORDS = ["fuck", "shit"];

const fromEnv = (process.env.BLOCKED_WORDS || "")
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

const words = [...DEFAULT_WORDS, ...fromEnv];

// "F u-c.k" and "FUCK" are both caught
export const isBlockedName = (name) => {
    const squashed = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return words.some((word) => squashed.includes(word));
};
