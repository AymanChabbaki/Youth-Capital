import { Request, Response } from "express";
import { z } from "zod";
import * as ideasService from "../services/ideas.service";

const createIdeaSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  departmentId: z.string().uuid(),
  openToCollab: z.boolean(),
  pdfUrl: z.string().url(),
  contactInfo: z.string().min(1),
});

export async function create(req: Request, res: Response) {
  const input = createIdeaSchema.parse(req.body);
  const idea = await ideasService.createIdea(req.params.jihaCode, req.userId!, input);
  res.status(201).json(idea);
}

export async function getOne(req: Request, res: Response) {
  const idea = await ideasService.getIdeaForUser(req.params.jihaCode, req.params.ideaId, req.userId!);
  res.json(idea);
}

export async function submittedBoard(req: Request, res: Response) {
  const ideas = await ideasService.listSubmittedBoard(req.params.jihaCode);
  res.json(ideas);
}

export async function approvedBoard(req: Request, res: Response) {
  const ideas = await ideasService.listApprovedBoard(req.params.jihaCode);
  res.json(ideas);
}
