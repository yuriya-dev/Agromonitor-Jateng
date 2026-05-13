import { Router } from 'express';
import { getAllCommodities, getCommodityBySlug } from '../controllers/commodityController';

const router = Router();

router.get('/', getAllCommodities);
router.get('/:slug', getCommodityBySlug);

export default router;
