// src/components/manager/Stock.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import api from "../../services/api";

export default function Stock() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);

  // ✅ Fetch menu items
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/menu-items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenus(res.data);
      } catch (err) {
        console.error("Error loading stock:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  // ✅ Handle Edit
  const handleEdit = (item) => {
    setEditItem(item);
    setNewStock(item.stock_quantity ?? 0);
    setIsAvailable(!!item.is_available);
  };

  // ✅ Handle Stock Update
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/menu-items/${editItem.id}/stock`,
        {
          stock_quantity: Number(newStock),
          is_available: isAvailable,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Stock updated successfully!");

      // Update UI instantly (no full reload)
      setMenus((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? {
                ...item,
                stock_quantity: Number(newStock),
                is_available: isAvailable,
              }
            : item
        )
      );

      setEditItem(null);
    } catch (err) {
      alert("❌ Failed to update stock");
      console.error(err);
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
        <h3 className="text-success mb-3">📦 Stock Management</h3>

        {loading ? (
          <p>Loading stock data...</p>
        ) : (
          <table className="table table-striped table-bordered bg-white shadow-sm">
            <thead className="table-success text-center">
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((item) => (
                <tr key={item.id} className="text-center">
                  <td>{item.id}</td>

                  {/* ✅ Image */}
                  <td>
                    {item.image ? (
                      <img
                        src={`http://127.0.0.1:8000/storage/${item.image}`}
                        alt={item.name}
                        width="50"
                        height="50"
                        style={{
                          borderRadius: "6px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span className="text-muted small">No Image</span>
                    )}
                  </td>

                  <td>{item.name}</td>
                  <td>{item.category}</td>

                  {/* ✅ Stock quantity + Low Stock Alert */}
                  <td>
                    {item.stock_quantity ?? 0}{" "}
                    {item.stock_quantity <= 5 && (
                      <span className="badge bg-warning text-dark ms-2">
                        ⚠ Low Stock
                      </span>
                    )}
                  </td>

                  {/* ✅ Availability Status */}
                  <td>
                    {item.is_available ? (
                      <span className="badge bg-success">Available</span>
                    ) : (
                      <span className="badge bg-danger">Out of Stock</span>
                    )}
                  </td>

                  {/* ✅ Edit button */}
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(item)}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ✅ Edit Modal */}
        {editItem && (
          <div
            className="modal fade show"
            style={{
              display: "block",
              background: "rgba(0,0,0,0.5)",
              zIndex: 1050,
            }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-success">
                    ✏️ Edit Stock — {editItem.name}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setEditItem(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newStock}
                      min="0"
                      onChange={(e) => setNewStock(e.target.value)}
                    />
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      id="availableCheck"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="availableCheck"
                    >
                      Mark as Available
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditItem(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-success" onClick={handleUpdate}>
                    💾 Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
