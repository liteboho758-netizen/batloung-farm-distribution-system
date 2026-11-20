import pool from "../config/db.js";
import { httpError, requireFields } from "../utils/httpError.js";
export async function addPayment(req,res) {
  const {sale_id,payment_method,amount}=req.body;
  requireFields(req.body,["sale_id","payment_method","amount"]);
  const value=Number(amount);
  if(!Number.isFinite(value)||value<=0) throw httpError(400,"Payment amount must be greater than zero.");
  const conn=await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[sale]]=await conn.query("SELECT * FROM sales WHERE sale_id=? FOR UPDATE",[sale_id]);
    if(!sale) throw httpError(404,"Sale not found.");
    const balance=Number(sale.total_amount)-Number(sale.amount_paid);
    if(value>balance) throw httpError(400,`Payment exceeds outstanding balance of ${balance}.`);
    await conn.query("INSERT INTO payments (sale_id,payment_method,amount) VALUES (?,?,?)",[sale_id,payment_method,value]);
    const paid=Number(sale.amount_paid)+value;
    const status=paid===Number(sale.total_amount)?"PAID":"PARTIALLY_PAID";
    await conn.query("UPDATE sales SET amount_paid=?,payment_status=? WHERE sale_id=?",[paid,status,sale_id]);
    await conn.commit();
    res.status(201).json({message:"Payment recorded.",sale_id,amount_paid:paid,outstanding_balance:Number(sale.total_amount)-paid,payment_status:status});
  } catch(e){await conn.rollback();throw e;} finally{conn.release();}
}
