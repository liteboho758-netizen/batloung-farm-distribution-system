
import pool from "../config/db.js";

// 1. Get the top five fruits sold
export async function topFruits(req, res) {
  const [rows] = await pool.query(
    `SELECT
       f.fruit_name,
       SUM(sd.quantity) AS boxes_sold
     FROM sales_details sd
     JOIN fruits f ON f.fruit_id = sd.fruit_id
     GROUP BY f.fruit_id, f.fruit_name
     ORDER BY boxes_sold DESC
     LIMIT 5`
  );

  res.json(rows);
}

// 2. Calculate revenue between two dates
export async function revenue(req, res) {
  const from = req.query.from;
  const to = req.query.to;

  if (!from || !to) {
    return res.status(400).json({
      message: "Provide from and to dates (YYYY-MM-DD)."
    });
  }

  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0) AS revenue
     FROM sales
     WHERE DATE(sale_date) BETWEEN ? AND ?`,
    [from, to]
  );

  res.json({
    from,
    to,
    ...rows[0]
  });
}

// 3. Find the top vendor
export async function topVendor(req, res) {
  const [rows] = await pool.query(
    `SELECT
       v.vendor_id,
       v.vendor_name,
       SUM(sd.quantity) AS boxes_purchased
     FROM sales s
     JOIN vendors v ON v.vendor_id = s.vendor_id
     JOIN sales_details sd ON sd.sale_id = s.sale_id
     GROUP BY v.vendor_id, v.vendor_name
     ORDER BY boxes_purchased DESC
     LIMIT 1`
  );

  res.json(rows[0] || null);
}

// 4. Get stock report
export async function stockReport(req, res) {
  const [rows] = await pool.query(
    `SELECT
       f.fruit_name,
       s.packaging_size,
       s.available_quantity
     FROM stock s
     JOIN fruits f ON f.fruit_id = s.fruit_id
     ORDER BY f.fruit_name, s.packaging_size`
  );

  res.json(rows);
}

// 5. Calculate vendor balances
export async function vendorBalances(req, res) {
  const [rows] = await pool.query(
    `SELECT
       v.vendor_id,
       v.vendor_name,
       COALESCE(s.total_sales, 0) AS total_sales,
       COALESCE(p.total_paid, 0) AS total_paid,
       COALESCE(s.total_sales, 0) -
       COALESCE(p.total_paid, 0) AS outstanding_balance
     FROM vendors v

     LEFT JOIN (
       SELECT
         vendor_id,
         SUM(total_amount) AS total_sales
       FROM sales
       GROUP BY vendor_id
     ) s ON s.vendor_id = v.vendor_id

     LEFT JOIN (
       SELECT
         sa.vendor_id,
         SUM(pay.amount) AS total_paid
       FROM sales sa
       JOIN payments pay
         ON pay.sale_id = sa.sale_id
       GROUP BY sa.vendor_id
     ) p ON p.vendor_id = v.vendor_id

     ORDER BY outstanding_balance DESC`
  );

  res.json(rows);
}
