import { Router } from 'express';
import { trackVisitor, getVisitorGeo } from '../controllers/visitor.controller';

const router = Router();

// Public tracking endpoint (still behind global rate limiter)
router.post('/track', trackVisitor);

// GeoIP helper (public) — used by frontend to enrich visitor info
router.get('/geo', getVisitorGeo);

export default router;

