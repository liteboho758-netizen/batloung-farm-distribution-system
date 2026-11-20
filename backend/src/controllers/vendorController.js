import pool from "../config/db.js";
import { makeCrudController } from "./crudController.js";
const crud = makeCrudController({ table:"vendors", id:"vendor_id", fields:["vendor_name","phone_number","location","registration_date"], required:["vendor_name","phone_number","location"] });
export default {
  ...crud,
  list: async (req,res) => {
    const q = (req.query.search || "").trim();
    const [rows] = await pool.query(
      "SELECT * FROM vendors WHERE vendor_name LIKE ? OR phone_number LIKE ? ORDER BY vendor_id DESC",
      [`%${q}%`,`%${q}%`]
    );
    res.json(rows);
  }
};
