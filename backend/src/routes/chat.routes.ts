import { Router } from 'express';
import { chatWithBot } from '../controllers/chat.controller';

const router = Router();

// Public chatbot endpoint (rate-limited by general /api limiter)
router.post('/', chatWithBot);

export default router;

