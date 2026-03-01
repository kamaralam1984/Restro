import { Request, Response } from 'express';
import { RentalPlan } from '../models/RentalPlan.model';

// ─── List all active plans (public) ──────────────────────────────────────────

export const getPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await RentalPlan.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── List all plans (super admin, includes inactive) ─────────────────────────

export const getAllPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await RentalPlan.find().sort({ sortOrder: 1 }).lean();
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Create plan ──────────────────────────────────────────────────────────────

export const createPlan = async (req: Request, res: Response) => {
  try {
    const plan = await RentalPlan.create(req.body);
    res.status(201).json({ message: 'Plan created', plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Update plan ──────────────────────────────────────────────────────────────

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const plan = await RentalPlan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan updated', plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Delete / deactivate plan ─────────────────────────────────────────────────

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const plan = await RentalPlan.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deactivated', plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
