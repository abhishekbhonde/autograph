import rateLimit from "express-rate-limit";

// Limits how often one IP address can create signatures.
export const createLimiter = ({ windowMs = 60 * 1000, max = 5 } = {}) =>
    rateLimit({
        windowMs,
        limit: max,
        standardHeaders: "draft-7", // adds RateLimit headers to responses
        legacyHeaders: false,
        message: { message: "Too many attempts. Please try again in a minute." },
    });
