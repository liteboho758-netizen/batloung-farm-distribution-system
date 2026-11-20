export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
export function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");
  if (missing.length) throw httpError(400, `Required field(s): ${missing.join(", ")}`);
}
export const PACK_SIZES = ["SMALL", "MEDIUM", "LARGE"];
export function validatePack(size) {
  if (!PACK_SIZES.includes(String(size || "").toUpperCase())) throw httpError(400, "Packaging size must be SMALL, MEDIUM or LARGE.");
  return String(size).toUpperCase();
}
