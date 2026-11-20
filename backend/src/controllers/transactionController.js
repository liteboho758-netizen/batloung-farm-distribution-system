import pool from "../config/db.js";
import { httpError, requireFields, validatePack } from "../utils/httpError.js";

export async function createPurchase(req,res) {
  const { supplier_id, purchase_date, items } = req.body;
  requireFields(req.body, ["supplier_id"]);
  if (!Array.isArray(items) || !items.length) throw httpError(400,"Add at least one purchase item.");
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[supplier]] = await conn.query("SELECT supplier_id FROM suppliers WHERE supplier_id=? FOR UPDATE",[supplier_id]);
    if (!supplier) throw httpError(404,"Supplier not found.");
    let total = 0;
    const [purchase] = await conn.query(
      "INSERT INTO purchases (supplier_id,purchase_date,total_amount) VALUES (?,?,0)",
      [supplier_id,purchase_date || new Date()]
    );
    for (const item of items) {
      const size = validatePack(item.packaging_size);
      const qty = Number(item.quantity), cost = Number(item.unit_cost);
      if (!item.fruit_id || !Number.isInteger(qty) || qty <= 0 || !Number.isFinite(cost) || cost < 0) throw httpError(400,"Each item needs a valid fruit, positive whole quantity and non-negative unit cost.");
      const [[fruit]] = await conn.query("SELECT fruit_id FROM fruits WHERE fruit_id=?",[item.fruit_id]);
      if (!fruit) throw httpError(404,`Fruit ${item.fruit_id} not found.`);
      total += qty * cost;
      await conn.query("INSERT INTO purchase_details (purchase_id,fruit_id,quantity,unit_cost,packaging_size) VALUES (?,?,?,?,?)",
        [purchase.insertId,item.fruit_id,qty,cost,size]);
      await conn.query(
        `INSERT INTO stock (fruit_id,packaging_size,available_quantity) VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE available_quantity=available_quantity+VALUES(available_quantity)`,
        [item.fruit_id,size,qty]
      );
    }
    await conn.query("UPDATE purchases SET total_amount=? WHERE purchase_id=?",[total,purchase.insertId]);
    await conn.commit();
    res.status(201).json({message:"Purchase recorded and stock updated.",purchase_id:purchase.insertId,total_amount:total});
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}

export async function createSale(req,res) {
  const { vendor_id, sale_date, payment_method="CASH", amount_paid=0, items } = req.body;
  requireFields(req.body,["vendor_id"]);
  if (!Array.isArray(items) || !items.length) throw httpError(400,"Add at least one sale item.");
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[vendor]] = await conn.query("SELECT vendor_id FROM vendors WHERE vendor_id=?",[vendor_id]);
    if (!vendor) throw httpError(404,"Vendor not found.");
    let total=0;
    const prepared=[];
    for (const item of items) {
      const size=validatePack(item.packaging_size);
      const qty=Number(item.quantity);
      if (!item.fruit_id || !Number.isInteger(qty) || qty<=0) throw httpError(400,"Each sale item needs a fruit and positive whole quantity.");
      const [[fruit]] = await conn.query("SELECT fruit_id FROM fruits WHERE fruit_id=?",[item.fruit_id]);
      if (!fruit) throw httpError(404,`Fruit ${item.fruit_id} not found.`);
      const [[price]] = await conn.query("SELECT unit_price FROM selling_prices WHERE fruit_id=? AND packaging_size=?",[item.fruit_id,size]);
      if (!price) throw httpError(400,`No selling price configured for fruit ${item.fruit_id} (${size}).`);
      const [stockRows] = await conn.query("SELECT stock_id,available_quantity FROM stock WHERE fruit_id=? AND packaging_size=? FOR UPDATE",[item.fruit_id,size]);
      if (!stockRows.length || stockRows[0].available_quantity < qty) throw httpError(400,`Insufficient ${size.toLowerCase()} stock for fruit ${item.fruit_id}. Available: ${stockRows[0]?.available_quantity || 0}, requested: ${qty}.`);
      total += qty * Number(price.unit_price);
      prepared.push({fruit_id:item.fruit_id,size,qty,price:Number(price.unit_price),stock_id:stockRows[0].stock_id});
    }
    const paid=Number(amount_paid);
    if (!Number.isFinite(paid) || paid<0 || paid>total) throw httpError(400,"Amount paid must be between zero and the sale total.");
    const status=paid===0?"UNPAID":paid===total?"PAID":"PARTIALLY_PAID";
    const [sale] = await conn.query(
      "INSERT INTO sales (vendor_id,sale_date,payment_status,total_amount,payment_method,amount_paid) VALUES (?,?,?,?,?,?)",
      [vendor_id,sale_date || new Date(),status,total,payment_method,paid]
    );
    for (const item of prepared) {
      await conn.query("INSERT INTO sales_details (sale_id,fruit_id,packaging_size,quantity,unit_price) VALUES (?,?,?,?,?)",
        [sale.insertId,item.fruit_id,item.size,item.qty,item.price]);
      await conn.query("UPDATE stock SET available_quantity=available_quantity-? WHERE stock_id=?",[item.qty,item.stock_id]);
    }
    await conn.commit();
    res.status(201).json({message:"Sale completed and stock reduced.",sale_id:sale.insertId,total_amount:total,amount_paid:paid,outstanding_balance:total-paid,payment_status:status});
  } catch(e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}
