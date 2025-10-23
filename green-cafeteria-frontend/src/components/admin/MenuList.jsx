import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import api from "../../services/api";

export default function MenuList() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock_quantity: "",
    description: "",
    image: null,
  });

  // ✅ Fetch Menu Items
  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/menu-items", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔹 Auto mark unavailable if stock = 0
      const updatedMenus = response.data.map((item) => ({
        ...item,
        is_available: item.stock_quantity > 0 ? 1 : 0,
      }));

      setMenus(updatedMenus);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // ✅ Delete Menu Item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/menu-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Menu item deleted successfully!");
      fetchMenus();
    } catch (err) {
      console.error("Error deleting menu:", err);
      alert("❌ Failed to delete item!");
    }
  };

  // ✅ Edit Menu Item
  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      stock_quantity: item.stock_quantity,
      description: item.description,
      image: null,
    });
  };

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Image Change
  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // ✅ Update Menu Item
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      for (let key in formData) {
        if (formData[key] !== null) data.append(key, formData[key]);
      }

      const stockQty = parseInt(formData.stock_quantity || 0);
      data.append("is_available", stockQty > 0 ? 1 : 0);

      await api.post(`/menu-items/${editItem.id}?_method=PUT`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Menu updated successfully!");
      setEditItem(null);
      fetchMenus();
    } catch (error) {
      console.error("Error updating menu:", error);
      alert("❌ Failed to update menu!");
    }
  };

  // ✅ Filter + Search
  const filteredMenus = menus.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" ||
      item.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // ✅ Sorting
  const sortedMenus = filteredMenus.sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "price") {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    }
    return 0;
  });

  // ✅ Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMenus = sortedMenus.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedMenus.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // ✅ Sorting Toggle
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
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
        <div className="container">
          <h3 className="text-success mb-4">🍽️ Menu Items List</h3>

          {/* 🔍 Search & Filter */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              placeholder="Search by name..."
              className="form-control me-2"
              style={{ width: "40%" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* ✅ Only Breakfast & Lunch */}
            <select
              className="form-select me-2"
              style={{ width: "25%" }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
            </select>

            <div>
              <button
                className="btn btn-outline-success me-2"
                onClick={() => toggleSort("name")}
              >
                Sort by Name{" "}
                {sortBy === "name" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => toggleSort("price")}
              >
                Sort by Price{" "}
                {sortBy === "price" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
              </button>
            </div>
          </div>

          {/* ✅ Table */}
          {loading ? (
            <p>Loading menu items...</p>
          ) : currentMenus.length === 0 ? (
            <div className="alert alert-warning text-center">
              No menu items match your search.
            </div>
          ) : (
            <>
              <table className="table table-bordered table-striped shadow-sm">
                <thead className="table-success text-center">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Image</th>
                    <th>Category</th>
                    <th>Price (৳)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMenus.map((item) => (
                    <tr key={item.id} className="text-center">
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>
                        {item.image ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${item.image}`}
                            alt={item.name}
                            width="70"
                            height="70"
                            style={{
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span className="text-muted">No Image</span>
                        )}
                      </td>
                      <td>{item.category}</td>
                      <td>{item.price}</td>
                      <td>
                        {item.stock_quantity === 0 ? (
                          <span className="badge bg-danger">Unavailable</span>
                        ) : item.is_available ? (
                          <span className="badge bg-success">Available</span>
                        ) : (
                          <span className="badge bg-secondary">Out of Stock</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ✅ Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ⬅️ Previous
                </button>

                <span className="fw-bold">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next ➡️
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {editItem && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">✏️ Edit Menu Item</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditItem(null)}
                ></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Category</label>
                    <input
                      type="text"
                      name="category"
                      className="form-control"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Price (৳)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      name="stock_quantity"
                      className="form-control"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={formData.description || ""}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label>Image</label>
                    <input
                      type="file"
                      name="image"
                      className="form-control"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditItem(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
