# API request examples

All requests use `http://localhost:5000/api`.

## Create a purchase
`POST /purchases`
```json
{
  "supplier_id": 1,
  "items": [
    {"fruit_id": 1, "quantity": 12, "packaging_size": "SMALL", "unit_cost": 45},
    {"fruit_id": 2, "quantity": 8, "packaging_size": "MEDIUM", "unit_cost": 70}
  ]
}
```

## Create a sale
`POST /sales`
```json
{
  "vendor_id": 1,
  "payment_method": "MOBILE_MONEY",
  "amount_paid": 500,
  "items": [
    {"fruit_id": 1, "quantity": 2, "packaging_size": "SMALL"},
    {"fruit_id": 2, "quantity": 1, "packaging_size": "LARGE"}
  ]
}
```

## Record another payment against an existing sale
`POST /payments`
```json
{"sale_id": 1, "payment_method": "CASH", "amount": 100}
```

## Useful reports
- `GET /reports/top-fruits`
- `GET /reports/revenue?from=2026-11-01&to=2026-11-30`
- `GET /reports/top-vendor`
- `GET /reports/stock`
- `GET /reports/vendor-balances`
