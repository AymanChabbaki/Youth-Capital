import { Request, Response } from "express";
import { z } from "zod";
import * as collabService from "../services/collab.service";

export async function request(req: Request, res: Response) {
  const request = await collabService.requestCollab(req.params.jihaCode, req.params.ideaId, req.userId!);
  res.status(201).json(request);
}

const decisionSchema = z.object({ decision: z.enum(["approved", "rejected"]) });

export async function decide(req: Request, res: Response) {
  const { decision } = decisionSchema.parse(req.body);
  const request = await collabService.decideCollabRequest(req.params.jihaCode, req.params.requestId, decision);
  res.json(request);
}
