import { z } from "zod";

// Blocks javascript:/data:/etc. payloads in fields rendered as href/src on the frontend.
export const httpUrl = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//i.test(v), { message: "URL must use http or https" });

export const optionalHttpUrl = httpUrl.optional().or(z.literal("")).transform((v) => (v ? v : undefined));
