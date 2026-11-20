
import React, { useEffect, useState } from "react";
import { api } from "./services/api";

const pages = [
  "Dashboard",
  "Suppliers",
  "Fruits & Stock",
  "Vendors",
  "Purchases",
  "Sales",
  "Reports"
];

const provinces = [
  "Gauteng",
  "Free State",
  "KwaZulu-Natal",
  "Western Cape",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West"
];

const sizes = ["SMALL", "MEDIUM", "LARGE"];

const emptySupplier = {
  business_name: "",
  contact_person: "",
  phone: "",
  province: "Gauteng",
  address: ""
};

const emptyVendor = {
  vendor_name: "",
  phone_number: "",
  location: ""
};

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const [supplier, setSupplier] = useState({ ...emptySupplier });
  const [editingSupplierId, setEditingSupplierId] = useState(null);

  const [vendor, setVendor] = useState({ ...emptyVendor });
  const [editingVendorId, setEditingVendorId] = useState(null);

  const [fruit, setFruit] = useState({
    fruit_name: "Apples",
    description: "",
    status: "AVAILABLE"
  });

  const [purchase, setPurchase] = useState({
    supplier_id: "",
    items: [
      {
        fruit_id: "",
        quantity: 1,
        packaging_size: "SMALL",
        unit_cost: 0
      }
    ]
  });

  const [sale, setSale] = useState({
    vendor_id: "",
    payment_method: "CASH",
    amount_paid: 0,
    items: [
      {
        fruit_id: "",
        quantity: 1,
        packaging_size: "SMALL"
      }
    ]
  });

  const [search, setSearch] = useState("");

  // LOAD APPLICATION DATA
  async function load() {
    setLoading(true);
    setError("");

    try {
      const calls = {
        suppliers: api.get("/suppliers"),
        fruits: api.get("/fruits"),
        vendors: api.get("/vendors"),
        stock: api.get("/stock"),
        low: api.get("/fruits/low-stock"),
        balances: api.get("/reports/vendor-balances"),
        top: api.get("/reports/top-fruits")
      };

      const keys = Object.keys(calls);
      const values = await Promise.all(Object.values(calls));

      const next = {};

      keys.forEach((key, index) => {
        next[key] = values[index];
      });

      setData(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // COMMON OPERATION HANDLER
  const run = async (fn) => {
    setError("");
    setNotice("");

    try {
      await fn();
      setNotice("Operation completed successfully.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  // REUSABLE FORM FIELD
  const field = (
    label,
    value,
    onChange,
    type = "text",
    options = null
  ) => (
    <label>
      {label}

      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      )}
    </label>
  );

  // REUSABLE TABLE
  const table = (headers, rows) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((value, column) => (
                  <td key={column}>{value ?? "—"}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // ADD PURCHASE OR SALE ITEM
  const addItem = (obj, setter, kind) => {
    const newItem =
      kind === "purchase"
        ? {
            fruit_id: "",
            quantity: 1,
            packaging_size: "SMALL",
            unit_cost: 0
          }
        : {
            fruit_id: "",
            quantity: 1,
            packaging_size: "SMALL"
          };

    setter({
      ...obj,
      items: [...obj.items, newItem]
    });
  };

  // UPDATE PURCHASE OR SALE ITEM
  const updateItem = (obj, setter, index, key, value) => {
    setter({
      ...obj,
      items: obj.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    });
  };

  const fruitOptions = (data.fruits || []).map((fruit) => (
    <option key={fruit.fruit_id} value={fruit.fruit_id}>
      {fruit.fruit_name}
    </option>
  ));

  // DASHBOARD
  const dashboard = (
    <>
      <div className="stats">
        <article>
          <span>Suppliers</span>
          <b>{data.suppliers?.length || 0}</b>
        </article>

        <article>
          <span>Fruits</span>
          <b>{data.fruits?.length || 0}</b>
        </article>

        <article>
          <span>Vendors</span>
          <b>{data.vendors?.length || 0}</b>
        </article>

        <article>
          <span>Stock records</span>
          <b>{data.stock?.length || 0}</b>
        </article>
      </div>

      <h2>Low stock alerts</h2>

      {table(
        ["Fruit", "Packaging", "Available boxes"],
        (data.low || []).map((item) => [
          item.fruit_name,
          item.packaging_size,
          item.available_quantity
        ])
      )}
    </>
  );

  let content;

  if (page === "Dashboard") {
    content = dashboard;
  }

  // =====================================
  // SUPPLIERS - ADD, EDIT AND DELETE
  // =====================================

  if (page === "Suppliers") {
    content = (
      <>
        <h2>
          {editingSupplierId ? "Edit supplier" : "Register supplier"}
        </h2>

        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();

            run(async () => {
              if (editingSupplierId) {
                await api.put(
                  `/suppliers/${editingSupplierId}`,
                  supplier
                );
              } else {
                await api.post("/suppliers", supplier);
              }

              setSupplier({ ...emptySupplier });
              setEditingSupplierId(null);
            });
          }}
        >
          {field(
            "Business name",
            supplier.business_name,
            (value) =>
              setSupplier({ ...supplier, business_name: value })
          )}

          {field(
            "Contact person",
            supplier.contact_person,
            (value) =>
              setSupplier({ ...supplier, contact_person: value })
          )}

          {field(
            "Phone",
            supplier.phone,
            (value) =>
              setSupplier({ ...supplier, phone: value })
          )}

          {field(
            "Province",
            supplier.province,
            (value) =>
              setSupplier({ ...supplier, province: value }),
            "text",
            provinces
          )}

          {field(
            "Address",
            supplier.address,
            (value) =>
              setSupplier({ ...supplier, address: value })
          )}

          <button type="submit">
            {editingSupplierId ? "Update supplier" : "Add supplier"}
          </button>

          {editingSupplierId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setSupplier({ ...emptySupplier });
                setEditingSupplierId(null);
                setError("");
              }}
            >
              Cancel editing
            </button>
          )}
        </form>

        <h2>Supplier records</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Business</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Province</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {(data.suppliers || []).length > 0 ? (
                data.suppliers.map((s) => (
                  <tr key={s.supplier_id}>
                    <td>{s.supplier_id}</td>
                    <td>{s.business_name}</td>
                    <td>{s.contact_person}</td>
                    <td>{s.phone}</td>
                    <td>{s.province}</td>
                    <td>{s.address}</td>

                    <td>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                          setSupplier({
                            business_name: s.business_name,
                            contact_person: s.contact_person,
                            phone: s.phone,
                            province: s.province,
                            address: s.address || ""
                          });

                          setEditingSupplierId(s.supplier_id);
                          setError("");
                          setNotice("");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${s.business_name}?`
                            )
                          ) {
                            run(() =>
                              api.del(`/suppliers/${s.supplier_id}`)
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // =====================================
  // FRUITS AND STOCK
  // =====================================

  if (page === "Fruits & Stock") {
    content = (
      <>
        <h2>Add fruit type</h2>

        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => api.post("/fruits", fruit));
          }}
        >
          {field(
            "Fruit name",
            fruit.fruit_name,
            (value) => setFruit({ ...fruit, fruit_name: value }),
            "text",
            ["Apples", "Bananas", "Oranges", "Mangoes", "Grapes"]
          )}

          {field(
            "Description",
            fruit.description,
            (value) => setFruit({ ...fruit, description: value })
          )}

          <button type="submit">Add fruit</button>
        </form>

        <h2>Current stock by packaging size</h2>

        {table(
          ["Fruit", "Packaging size", "Available boxes"],
          (data.stock || []).map((s) => [
            s.fruit_name,
            s.packaging_size,
            s.available_quantity
          ])
        )}

        <h2>Fruit list</h2>

        {table(
          ["ID", "Fruit", "Description", "Status"],
          (data.fruits || []).map((f) => [
            f.fruit_id,
            f.fruit_name,
            f.description,
            f.status
          ])
        )}
      </>
    );
  }

  // =====================================
  // VENDORS - ADD, EDIT AND DELETE
  // =====================================

  if (page === "Vendors") {
    const filteredVendors = (data.vendors || []).filter((v) =>
      `${v.vendor_name || ""} ${v.phone_number || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    content = (
      <>
        <h2>
          {editingVendorId ? "Edit vendor" : "Register vendor"}
        </h2>

        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();

            run(async () => {
              if (editingVendorId) {
                await api.put(
                  `/vendors/${editingVendorId}`,
                  vendor
                );
              } else {
                await api.post("/vendors", vendor);
              }

              setVendor({ ...emptyVendor });
              setEditingVendorId(null);
            });
          }}
        >
          {field(
            "Vendor name",
            vendor.vendor_name,
            (value) =>
              setVendor({ ...vendor, vendor_name: value })
          )}

          {field(
            "Phone number",
            vendor.phone_number,
            (value) =>
              setVendor({ ...vendor, phone_number: value })
          )}

          {field(
            "Location",
            vendor.location,
            (value) =>
              setVendor({ ...vendor, location: value })
          )}

          <button type="submit">
            {editingVendorId ? "Update vendor" : "Add vendor"}
          </button>

          {editingVendorId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setVendor({ ...emptyVendor });
                setEditingVendorId(null);
                setError("");
              }}
            >
              Cancel editing
            </button>
          )}
        </form>

        <h2>Vendor records</h2>

        <label className="search">
          Search vendor

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or phone number"
          />
        </label>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vendor</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map((v) => (
                  <tr key={v.vendor_id}>
                    <td>{v.vendor_id}</td>
                    <td>{v.vendor_name}</td>
                    <td>{v.phone_number}</td>
                    <td>{v.location}</td>
                    <td>{v.registration_date?.slice(0, 10)}</td>

                    <td>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                          setVendor({
                            vendor_name: v.vendor_name || "",
                            phone_number: v.phone_number || "",
                            location: v.location || ""
                          });

                          setEditingVendorId(v.vendor_id);
                          setError("");
                          setNotice("");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${v.vendor_name}?`
                            )
                          ) {
                            run(async () => {
                              await api.del(`/vendors/${v.vendor_id}`);

                              if (editingVendorId === v.vendor_id) {
                                setVendor({ ...emptyVendor });
                                setEditingVendorId(null);
                              }
                            });
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No vendors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // =====================================
  // PURCHASES
  // =====================================

  if (page === "Purchases") {
    content = (
      <>
        <h2>Record purchase</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            run(() =>
              api.post("/purchases", purchase).then(() =>
                setPurchase({
                  supplier_id: "",
                  items: [
                    {
                      fruit_id: "",
                      quantity: 1,
                      packaging_size: "SMALL",
                      unit_cost: 0
                    }
                  ]
                })
              )
            );
          }}
        >
          <label>
            Supplier

            <select
              required
              value={purchase.supplier_id}
              onChange={(e) =>
                setPurchase({
                  ...purchase,
                  supplier_id: e.target.value
                })
              }
            >
              <option value="">Choose supplier</option>

              {(data.suppliers || []).map((s) => (
                <option value={s.supplier_id} key={s.supplier_id}>
                  {s.business_name}
                </option>
              ))}
            </select>
          </label>

          {purchase.items.map((item, i) => (
            <div className="item-row" key={i}>
              <label>
                Fruit

                <select
                  required
                  value={item.fruit_id}
                  onChange={(e) =>
                    updateItem(
                      purchase,
                      setPurchase,
                      i,
                      "fruit_id",
                      e.target.value
                    )
                  }
                >
                  <option value="">Choose fruit</option>
                  {fruitOptions}
                </select>
              </label>

              <label>
                Packaging

                <select
                  value={item.packaging_size}
                  onChange={(e) =>
                    updateItem(
                      purchase,
                      setPurchase,
                      i,
                      "packaging_size",
                      e.target.value
                    )
                  }
                >
                  {sizes.map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </label>

              <label>
                Boxes

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      purchase,
                      setPurchase,
                      i,
                      "quantity",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Unit cost (M)

                <input
                  type="number"
                  min="0"
                  step=".01"
                  value={item.unit_cost}
                  onChange={(e) =>
                    updateItem(
                      purchase,
                      setPurchase,
                      i,
                      "unit_cost",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            className="secondary"
            onClick={() =>
              addItem(purchase, setPurchase, "purchase")
            }
          >
            + Add another item
          </button>

          <button type="submit">Save purchase</button>
        </form>

        <p className="hint">
          The server calculates the purchase total and increases
          the matching fruit/package stock.
        </p>
      </>
    );
  }

  // =====================================
  // SALES
  // =====================================

  if (page === "Sales") {
    content = (
      <>
        <h2>Record sale</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            run(() =>
              api.post("/sales", sale).then(() =>
                setSale({
                  vendor_id: "",
                  payment_method: "CASH",
                  amount_paid: 0,
                  items: [
                    {
                      fruit_id: "",
                      quantity: 1,
                      packaging_size: "SMALL"
                    }
                  ]
                })
              )
            );
          }}
        >
          <label>
            Vendor

            <select
              required
              value={sale.vendor_id}
              onChange={(e) =>
                setSale({ ...sale, vendor_id: e.target.value })
              }
            >
              <option value="">Choose vendor</option>

              {(data.vendors || []).map((v) => (
                <option key={v.vendor_id} value={v.vendor_id}>
                  {v.vendor_name}
                </option>
              ))}
            </select>
          </label>

          {sale.items.map((item, i) => (
            <div className="item-row" key={i}>
              <label>
                Fruit

                <select
                  required
                  value={item.fruit_id}
                  onChange={(e) =>
                    updateItem(
                      sale,
                      setSale,
                      i,
                      "fruit_id",
                      e.target.value
                    )
                  }
                >
                  <option value="">Choose fruit</option>
                  {fruitOptions}
                </select>
              </label>

              <label>
                Packaging

                <select
                  value={item.packaging_size}
                  onChange={(e) =>
                    updateItem(
                      sale,
                      setSale,
                      i,
                      "packaging_size",
                      e.target.value
                    )
                  }
                >
                  {sizes.map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </label>

              <label>
                Boxes

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      sale,
                      setSale,
                      i,
                      "quantity",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            className="secondary"
            onClick={() => addItem(sale, setSale, "sale")}
          >
            + Add another item
          </button>

          <div className="form-grid">
            <label>
              Payment method

              <select
                value={sale.payment_method}
                onChange={(e) =>
                  setSale({
                    ...sale,
                    payment_method: e.target.value
                  })
                }
              >
                {["CASH", "MOBILE_MONEY", "CREDIT"].map((method) => (
                  <option key={method}>{method}</option>
                ))}
              </select>
            </label>

            {field(
              "Amount paid (M)",
              sale.amount_paid,
              (value) => setSale({ ...sale, amount_paid: value }),
              "number"
            )}
          </div>

          <button type="submit">Complete sale</button>
        </form>

        <p className="hint">
          Prices are retrieved from the database. The complete
          sale is rejected and rolled back if any item has
          insufficient stock.
        </p>
      </>
    );
  }

  // =====================================
  // REPORTS
  // =====================================

  if (page === "Reports") {
    content = (
      <>
        <h2>Five most frequently sold fruits</h2>

        {table(
          ["Fruit", "Boxes sold"],
          (data.top || []).map((item) => [
            item.fruit_name,
            item.boxes_sold
          ])
        )}

        <h2>Vendor outstanding balances</h2>

        {table(
          [
            "Vendor",
            "Total sales (M)",
            "Paid (M)",
            "Outstanding (M)"
          ],
          (data.balances || []).map((item) => [
            item.vendor_name,
            Number(item.total_sales).toFixed(2),
            Number(item.total_paid).toFixed(2),
            Number(item.outstanding_balance).toFixed(2)
          ])
        )}

        <h2>Sales revenue by date range</h2>

        <RevenueReport />
      </>
    );
  }

  // =====================================
  // MAIN APPLICATION LAYOUT
  // =====================================

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="logo">BF</div>

          <div>
            <b>BATLOUNG FARM</b>
            <small>Distribution system</small>
          </div>
        </div>

        <nav>
          {pages.map((p) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              onClick={() => {
                setPage(p);
                setError("");
                setNotice("");
              }}
            >
              {p}
            </button>
          ))}
        </nav>

        <div className="side-foot">
          Maseru, Lesotho
          <br />
          Administrator portal
        </div>
      </aside>

      <main>
        <header>
          <div>
            <span className="eyebrow">
              FRESH PRODUCE MANAGEMENT
            </span>

            <h1>{page}</h1>
          </div>

          <button className="refresh" onClick={load}>
            ↻ Refresh
          </button>
        </header>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {notice && (
          <div className="alert success">
            {notice}
          </div>
        )}

        {loading && <p>Loading records…</p>}

        {content}
      </main>
    </div>
  );
}

// =====================================
// REVENUE REPORT COMPONENT
// =====================================

function RevenueReport() {
  const [from, setFrom] = useState("2026-11-01");
  const [to, setTo] = useState("2026-11-30");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  return (
    <div className="revenue">
      <label>
        From

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </label>

      <label>
        To

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </label>

      <button
        onClick={async () => {
          try {
            setError("");
            setResult(
              await api.get(
                `/reports/revenue?from=${from}&to=${to}`
              )
            );
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        Calculate revenue
      </button>

      {result && (
        <strong>
          Revenue: M {Number(result.revenue).toFixed(2)}
        </strong>
      )}

      {error && (
        <span className="error-text">{error}</span>
      )}
    </div>
  );
}
