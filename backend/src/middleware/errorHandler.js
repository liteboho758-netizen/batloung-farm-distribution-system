export default function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "A record with that unique value already exists." });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({ message: "This record is linked to another record and cannot be changed or deleted." });
  }
  res.status(err.status || 500).json({
    message: err.status ? err.message : "An unexpected server error occurred.",
    ...(process.env.NODE_ENV === "development" ? { detail: err.message } : {})
  });
}
