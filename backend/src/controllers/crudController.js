import pool from "../config/db.js";
import { httpError, requireFields } from "../utils/httpError.js";

export function makeCrudController({ table, id, fields, required = [] }) {
  return {
    list: async (req, res) => {
      const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${id} DESC`);
      res.json(rows);
    },
    get: async (req, res) => {
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${id} = ?`, [req.params.id]);
      if (!rows.length) throw httpError(404, "Record not found.");
      res.json(rows[0]);
    },
    create: async (req, res) => {
      requireFields(req.body, required);
      const keys = fields.filter((f) => req.body[f] !== undefined);
      const values = keys.map((f) => req.body[f]);
      const [result] = await pool.query(
        `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`, values
      );
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${id} = ?`, [result.insertId]);
      res.status(201).json(rows[0]);
    },
    update: async (req, res) => {
      const keys = fields.filter((f) => req.body[f] !== undefined);
      if (!keys.length) throw httpError(400, "Provide at least one field to update.");
      const [result] = await pool.query(
        `UPDATE ${table} SET ${keys.map((f) => `${f} = ?`).join(", ")} WHERE ${id} = ?`,
        [...keys.map((f) => req.body[f]), req.params.id]
      );
      if (!result.affectedRows) throw httpError(404, "Record not found.");
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${id} = ?`, [req.params.id]);
      res.json(rows[0]);
    },
    remove: async (req, res) => {
      const [result] = await pool.query(`DELETE FROM ${table} WHERE ${id} = ?`, [req.params.id]);
      if (!result.affectedRows) throw httpError(404, "Record not found.");
      res.json({ message: "Record deleted successfully." });
    }
  };
}
