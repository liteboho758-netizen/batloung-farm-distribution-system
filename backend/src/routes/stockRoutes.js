import { Router } from "express";
import { list } from "../controllers/stockController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router(); r.get("/",asyncHandler(list)); export default r;
