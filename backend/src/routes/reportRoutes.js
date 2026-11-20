import { Router } from "express";
import * as c from "../controllers/reportController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router();
r.get("/top-fruits",asyncHandler(c.topFruits)); r.get("/revenue",asyncHandler(c.revenue));
r.get("/top-vendor",asyncHandler(c.topVendor)); r.get("/stock",asyncHandler(c.stockReport));
r.get("/vendor-balances",asyncHandler(c.vendorBalances));
export default r;
