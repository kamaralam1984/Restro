import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'date' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip validation if field is optional and not provided
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${rule.field} must be a string`);
              continue;
            }
            if (rule.min && value.length < rule.min) {
              errors.push(`${rule.field} must be at least ${rule.min} characters`);
            }
            if (rule.max && value.length > rule.max) {
              errors.push(`${rule.field} must be at most ${rule.max} characters`);
            }
            break;

          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push(`${rule.field} must be a number`);
              continue;
            }
            if (rule.min !== undefined && value < rule.min) {
              errors.push(`${rule.field} must be at least ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
              errors.push(`${rule.field} must be at most ${rule.max}`);
            }
            break;

          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${rule.field} must be a valid email address`);
            }
            break;

          case 'phone':
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            const digitsOnly = value.replace(/\D/g, '');
            if (!phoneRegex.test(value) || digitsOnly.length < 10) {
              errors.push(`${rule.field} must be a valid phone number`);
            }
            break;

          case 'date':
            if (isNaN(Date.parse(value))) {
              errors.push(`${rule.field} must be a valid date`);
            }
            break;

          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${rule.field} must be an array`);
            }
            break;

          case 'object':
            if (typeof value !== 'object' || Array.isArray(value)) {
              errors.push(`${rule.field} must be an object`);
            }
            break;
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(`${rule.field} format is invalid`);
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `${rule.field} validation failed`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    next();
  };
};

// Pre-configured validators
export const validateMenuCreate = validate([
  { field: 'name', required: true, type: 'string', min: 1, max: 100 },
  { field: 'description', required: true, type: 'string', min: 1, max: 500 },
  { field: 'price', required: true, type: 'number', min: 0 },
  { field: 'category', required: true, type: 'string' },
          { field: 'isVeg', required: true },
]);

export const validateOrderCreate = validate([
  { field: 'items', required: true, type: 'array' },
  { field: 'customerName', required: true, type: 'string', min: 1 },
  { field: 'customerPhone', required: true, type: 'phone' },
  { field: 'customerEmail', type: 'email' },
]);

export const validateBookingCreate = validate([
  { field: 'customerName', required: true, type: 'string', min: 1 },
  { field: 'customerEmail', required: true, type: 'email' },
  { field: 'customerPhone', required: true, type: 'phone' },
  { field: 'date', required: true, type: 'date' },
  { field: 'time', required: true, type: 'string' },
  { field: 'numberOfGuests', required: true, type: 'number', min: 1, max: 20 },
]);

