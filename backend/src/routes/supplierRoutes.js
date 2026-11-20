import { Router } from "express";
import c from "../controllers/supplierController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router();
r.get("/",asyncHandler(c.list)); r.get("/:id",asyncHandler(c.get));
r.post("/",asyncHandler(c.create)); r.put("/:id",asyncHandler(c.update)); r.delete("/:id",asyncHandler(c.remove));
export default r;
