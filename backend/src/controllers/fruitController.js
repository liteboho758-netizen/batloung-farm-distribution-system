import pool from "../config/db.js";
import { makeCrudController } from "./crudController.js";
const crud = makeCrudController({ table:"fruits", id:"fruit_id", fields:["fruit_name","description","status"], required:["fruit_name"] });
export default {
  ...crud,
  list: async (req,res) => {
    const [rows] = await pool.query("SELECT * FROM fruits ORDER BY fruit_name");
    res.json(rows);
  },
  lowStock: async (req,res) => {
    const threshold = Number(req.query.threshold || process.env.LOW_STOCK_THRESHOLD || 10);
    const [rows] = await pool.query(
      `SELECT f.fruit_id, f.fruit_name, s.packaging_size, s.available_quantity
       FROM stock s JOIN fruits f ON f.fruit_id=s.fruit_id
       WHERE s.available_quantity <= ? ORDER BY s.available_quantity ASC`, [threshold]
    );
    res.json(rows);
  }
};
