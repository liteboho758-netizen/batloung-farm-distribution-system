import pool from "../config/db.js";
export async function list(req,res) {
  const [rows] = await pool.query(
    `SELECT s.stock_id, f.fruit_id, f.fruit_name, s.packaging_size, s.available_quantity
     FROM stock s JOIN fruits f ON f.fruit_id=s.fruit_id ORDER BY f.fruit_name, s.packaging_size`
  );
  res.json(rows);
}
