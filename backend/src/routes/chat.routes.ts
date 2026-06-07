import { Router } from 'express';
import { chatWithBot, chatWithRestaurantBot } from '../controllers/chat.controller';

const router = Router();

router.post('/', chatWithBot);
router.post('/restaurant', chatWithRestaurantBot);

export default router;

