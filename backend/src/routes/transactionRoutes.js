import { Router } from "express";
import { createPurchase,createSale } from "../controllers/transactionController.js";
import { addPayment } from "../controllers/paymentController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router();
r.post("/purchases",asyncHandler(createPurchase)); r.post("/sales",asyncHandler(createSale)); r.post("/payments",asyncHandler(addPayment));
export default r;
