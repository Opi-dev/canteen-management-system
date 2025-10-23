import React, { useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import api from "../../services/api";

export default function AddMenu() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock_quantity: "",
    description: "",
    image: null,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ✅ ইনপুট হ্যান্ডলিং (image সহ)
  const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (name === "image") {
    setFormData({
      ...formData,
      image: files && files.length > 0 ? files[0] : null, // ✅ file object
    });
  } else {
    setFormData({
      ...formData,
      [name]: value,
    });
  }
};

// 🧩 ফর্ম সাবমিট
// ✅ AddMenu.jsx (Final Fixed)
const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");

  try {
    const token = localStorage.getItem("token");

    // 🔹 FormData object বানাও
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock_quantity", formData.stock_quantity);
    formDataToSend.append("description", formData.description);

    if (formData.image) {
      formDataToSend.append("image", formData.image); // ✅ file object
    }

    // 🔹 API call (Content-Type দিও না)
    const response = await api.post("/menu-items", formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 201 || response.status === 200) {
      setMessage("✅ Menu item added successfully!");
      setFormData({
        name: "",
        category: "",
        price: "",
        stock_quantity: "",
        description: "",
        image: null,
      });
    }
  } catch (err) {
    console.error("❌ Error adding menu:", err.response?.data || err.message);
    alert(JSON.stringify(err.response?.data, null, 2));
    setError("❌ Failed to add menu item. Please try again.");
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
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div className="container">
          <h3 className="text-success mb-3">➕ Add New Menu Item</h3>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form
            onSubmit={handleSubmit}
            className="card p-4 shadow-sm bg-white"
            style={{ maxWidth: "650px", margin: "auto" }}
            encType="multipart/form-data" // ✅ এই লাইনটা খুব জরুরি
          >
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter item name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., breakfast, lunch, dinner"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Price (৳)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter price"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter stock quantity"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Image</label>
              <input
  type="file"
  name="image"
  accept="image/jpeg,image/png,image/jpg,image/gif"
  className="form-control"
  onChange={(e) =>
    setFormData({
      ...formData,
      image: e.target.files[0], // ✅ File object
    })
  }
/>



            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Write a short description..."
              ></textarea>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-success w-50">
                Save Menu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
