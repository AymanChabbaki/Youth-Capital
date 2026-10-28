import rateLimit from "express-rate-limit";

// In-memory store, so limits are best-effort on serverless (reset on cold start) —
// still raises the bar for brute force / credential stuffing / cost-abuse of paid APIs.

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many attempts, please try again later" },
});

export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many requests, please try again later" },
});

// Guests get 3 free questions per day (by IP); logged-in users skip this gate
// entirely and are governed only by chatLimiter above.
export const chatGuestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !!(req as any).user,
  message: { error: "LoginRequired", message: "Free question limit reached. Log in to keep chatting." },
});

// Sahara Autonomy Initiative consultation: this limiter's IP tracking is
// separate from the IP address stored on the feedback row itself (that one
// is recorded deliberately, with consent — see saharaFeedbackTable). This
// just throttles submission rate.
export const anonFeedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many submissions, please try again later" },
});

// Bulk admin email sends — low limit since one accidental double-click
// shouldn't be able to fire off a broadcast to every user twice.
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many email sends this hour, please wait before sending more" },
});
