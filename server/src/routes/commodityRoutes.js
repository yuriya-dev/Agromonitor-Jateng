"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commodityController_1 = require("../controllers/commodityController");
const router = (0, express_1.Router)();
router.get('/', commodityController_1.getAllCommodities);
router.get('/:slug/predict', commodityController_1.getCommodityPrediction);
router.get('/:slug', commodityController_1.getCommodityBySlug);
exports.default = router;
//# sourceMappingURL=commodityRoutes.js.map