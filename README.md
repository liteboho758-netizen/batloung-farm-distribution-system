# Batloung Farm Distribution Management System

A full-stack coursework project for the DIWA2110 Web Application Development take-home test.

## Included
- React + Vite admin interface
- Node.js + Express REST API
- MySQL database schema and realistic starter data
- Supplier, fruit, vendor, purchase, sales, stock and payment management
- Packaging-specific stock (SMALL, MEDIUM, LARGE)
- SQL reports, validation, transactions and API error handling

## Requirements
- Node.js 18+
- MySQL 8+
- npm

## 1. Create the database
Open MySQL Workbench/phpMyAdmin and run `database/batloung_farm.sql`.
The script creates the `batloung_farm` database, its tables and sample data.

## 2. Configure the backend
Open a terminal in `backend` and run:

```bash
npm install
```

Copy `.env.example` to `.env`, then set your own MySQL username and password.

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Test `http://localhost:5000/api/health`.

## 3. Run the frontend
Open a second terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Important notes
- Purchase and sale totals are calculated by the server. Do not send totals from the browser.
- Purchase/sale item arrays are processed in a MySQL transaction. If any item fails, the complete operation rolls back.
- Sale creation locks stock rows and rejects insufficient stock without partial updates.
- Set the `.env` values for your own computer. Never commit `.env` to GitHub.
- This is a coursework starter implementation. Review the code and practise explaining it before submission.

## Main API routes
- `/api/suppliers`
- `/api/fruits`
- `/api/vendors`
- `/api/stock`
- `/api/purchases`
- `/api/sales`
- `/api/reports`
- `/api/payments`

See `backend/src/routes` and the comments in the controllers for request shapes.
