import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "BadRequest",
        message: "Invalid request body",
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function clampPageParams(req: Request, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(String(req.query.page || "1")) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(String(req.query.limit || String(defaultLimit))) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}
