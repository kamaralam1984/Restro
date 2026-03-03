import { Request, Response } from 'express';
import { ErrorLog } from '../models/ErrorLog.model';

// List recent error logs with optional filters (status, restaurantId)
export const getErrorLogs = async (req: Request, res: Response) => {
  try {
    const { status, restaurantId, limit = 50 } = req.query as {
      status?: string;
      restaurantId?: string;
      limit?: string;
    };

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (restaurantId) filter.restaurantId = restaurantId;

    const logs = await ErrorLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 200))
      .lean();

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch error logs' });
  }
};

// Update status of an error log (open / investigating / resolved)
export const updateErrorLogStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: 'open' | 'investigating' | 'resolved' };

    if (!status || !['open', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const log = await ErrorLog.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).lean();

    if (!log) return res.status(404).json({ error: 'Error log not found' });

    res.json(log);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update error log' });
  }
};

