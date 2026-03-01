import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPaymentOrder,
} from '../controllers/payment.controller';

const router = Router();

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPaymentOrder);

export default router;

