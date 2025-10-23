// src/components/manager/Orders.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import api from "../../services/api";

export default function Orders() {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    payment_method: "Cash",
  });
  const [orderId, setOrderId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // ✅ Fetch menu items (only available ones)
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/menu-items", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 🔹 Filter only available items
        const availableItems = response.data.filter(
          (item) => item.is_available === 1 && item.stock_quantity > 0
        );

        setMenus(availableItems);
        setFilteredMenus(availableItems);

        // Unique categories
        const cats = [...new Set(availableItems.map((i) => i.category))];
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };
    fetchMenus();
  }, []);

  // ✅ Search + Category filter
  useEffect(() => {
    let results = menus;
    if (category !== "all") {
      results = results.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }
    if (searchTerm.trim() !== "") {
      results = results.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMenus(results);
    setCurrentPage(1);
  }, [searchTerm, category, menus]);

  // ✅ Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentMenus = filteredMenus.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);

  // ✅ Add to Cart
  const addToCart = (item) => {
    // 🔹 Prevent adding unavailable/out-of-stock items
    if (item.stock_quantity === 0 || item.is_available === 0) {
      alert("⚠️ This item is currently unavailable.");
      return;
    }

    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      if (existing.quantity < item.stock_quantity) {
        setCart(
          cart.map((c) =>
            c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          )
        );
      } else {
        alert("⚠️ Not enough stock available.");
      }
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // ✅ Increase Quantity
  const increaseQty = (id) => {
    setCart(
      cart.map((item) => {
        const menu = menus.find((m) => m.id === id);
        if (menu && item.quantity < menu.stock_quantity) {
          return { ...item, quantity: item.quantity + 1 };
        } else {
          alert("⚠️ Stock limit reached!");
          return item;
        }
      })
    );
  };

  // ✅ Decrease Quantity
  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ✅ Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // ✅ Total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Submit Order
  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert("⚠️ Please add at least one item to create an order.");
      return;
    }
    if (!form.customer_name.trim()) {
      alert("⚠️ Please enter customer name.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const items = cart.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await api.post(
        "/orders",
        {
          customer_name: form.customer_name,
          total_price: total,
          payment_method: form.payment_method,
          items,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Order Created! Voucher: ${res.data.voucher_code}`);
      setOrderId(res.data.order.id);
      setCart([]);
      setForm({ customer_name: "", payment_method: "Cash" });

      // Refresh stock
      const updatedMenus = menus.map((item) => {
        const ordered = items.find((o) => o.menu_item_id === item.id);
        if (ordered) {
          return {
            ...item,
            stock_quantity: item.stock_quantity - ordered.quantity,
          };
        }
        return item;
      });

      setMenus(updatedMenus.filter((item) => item.stock_quantity > 0));
      setFilteredMenus(updatedMenus.filter((item) => item.stock_quantity > 0));
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create order.");
    }
  };

  return (
    <div>
      <Sidebar />
      <Navbar />
      <div
        className="p-4"
        style={{
          marginLeft: "250px",
          marginTop: "70px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <h3 className="text-success mb-4">🧾 Create Order & Receive Payment</h3>

        {/* 🔍 Search + Filter */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h5 className="m-0">Available Menu Items</h5>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search by name..."
              style={{ width: "220px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: "180px" }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat?.charAt(0).toUpperCase() + cat?.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🧾 Menu Cards */}
        <div className="row">
          {currentMenus.length > 0 ? (
            currentMenus.map((item) => (
              <div className="col-md-3 mb-4" key={item.id}>
                <div className="card shadow-sm border-0">
                  {item.image ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${item.image}`}
                      alt={item.name}
                      className="card-img-top"
                      style={{
                        height: "150px",
                        objectFit: "cover",
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                      }}
                    />
                  ) : (
                    <div
                      className="bg-light text-center p-5"
                      style={{ height: "150px" }}
                    >
                      No Image
                    </div>
                  )}
                  <div className="card-body text-center">
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="text-muted small mb-1">
                      Category: <strong>{item.category}</strong>
                    </p>
                    <p className="fw-semibold text-success mb-2">
                      ৳{item.price}
                    </p>
                    {item.stock_quantity > 0 ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => addToCart(item)}
                      >
                        Add to Order
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No available menu items.</p>
          )}
        </div>

        {/* ⏩ Pagination */}
        {filteredMenus.length > itemsPerPage && (
          <div className="d-flex justify-content-center mt-3 gap-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀ Previous
            </button>
            <span className="align-self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next ▶
            </button>
          </div>
        )}

        {/* 🛒 Cart */}
        <div className="card shadow-sm p-4 mt-4">
          <h5>🛒 Current Order</h5>
          {cart.length === 0 ? (
            <p>No items added.</p>
          ) : (
            <table className="table table-bordered mt-3 align-middle text-center">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => decreaseQty(item.id)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => increaseQty(item.id)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>৳{item.price}</td>
                    <td>৳{item.price * item.quantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.id)}
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="4" className="text-end fw-bold">
                    Total:
                  </td>
                  <td>৳{total}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* 💵 Payment & Voucher */}
        <div className="card shadow-sm p-4 mt-4">
          <h5>💰 Payment & Voucher</h5>
          <div className="row">
            <div className="col-md-4">
              <label>Customer Name</label>
              <input
                className="form-control"
                value={form.customer_name}
                onChange={(e) =>
                  setForm({ ...form, customer_name: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-4">
              <label>Payment Method</label>
              <select
                className="form-select"
                value={form.payment_method}
                onChange={(e) =>
                  setForm({ ...form, payment_method: e.target.value })
                }
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Mobile Banking</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-success mt-3"
            disabled={cart.length === 0}
          >
            💵 Generate Voucher & Receive Payment
          </button>

          {orderId && (
            <div className="d-flex gap-3 mt-3">
              <button
                className="btn btn-outline-primary"
                onClick={() =>
                  window.open(
                    `http://127.0.0.1:8000/api/orders/${orderId}/voucher`,
                    "_blank"
                  )
                }
              >
                📄 Download Voucher (PDF)
              </button>

              <button
                className="btn btn-outline-success"
                onClick={() => {
                  const pdfUrl = `http://127.0.0.1:8000/api/orders/${orderId}/voucher`;
                  window.open(pdfUrl, "_blank");
                  alert(
                    "Voucher opened in a new tab. Use Ctrl+P or the Print icon to print."
                  );
                }}
              >
                🖨️ Print Voucher
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
