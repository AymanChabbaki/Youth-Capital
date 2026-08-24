import { z } from "zod";

// Blocks javascript:/data:/etc. payloads in fields rendered as href/src on the frontend.
export const httpUrl = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//i.test(v), { message: "URL must use http or https" });

export const optionalHttpUrl = httpUrl.optional().or(z.literal("")).transform((v) => (v ? v : undefined));

export const linkedinUrl = httpUrl.refine((v) => /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(v), {
  message: "Must be a linkedin.com URL",
});

export const optionalLinkedinUrl = linkedinUrl.optional().or(z.literal("")).transform((v) => (v ? v : undefined));
