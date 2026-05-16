import { Router } from 'express';
import { getAllCommodities, getCommodityBySlug, getCommodityPrediction } from '../controllers/commodityController';

const router = Router();

router.get('/', getAllCommodities);
router.get('/:slug/predict', getCommodityPrediction);
router.get('/:slug', getCommodityBySlug);

export default router;
