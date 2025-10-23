import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import api from "../../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager",
  });

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Add / Update User (with optional password reset)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editUser) {
        // 🟡 Update existing user
        const updatedData = { ...formData };
        if (!updatedData.password) delete updatedData.password; // remove blank password
        await api.put(`/users/${editUser.id}`, updatedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ User updated successfully!");
      } else {
        // 🟢 Create new user
        await api.post("/users", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ New user added successfully!");
      }

      setFormData({ name: "", email: "", password: "", role: "manager" });
      setEditUser(null);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      alert("❌ Failed to save user. Check console for details.");
    }
  };

  // ✅ Edit button click
  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowModal(true);
  };

  // ✅ Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("❌ Failed to delete user!");
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="text-success">👥 Manage Users</h3>
            <button
              className="btn btn-success"
              onClick={() => {
                setEditUser(null);
                setFormData({ name: "", email: "", password: "", role: "manager" });
                setShowModal(true);
              }}
            >
              ➕ Add User
            </button>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <div className="alert alert-warning text-center">No users found.</div>
          ) : (
            <table className="table table-bordered table-striped shadow-sm">
              <thead className="table-success text-center">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="text-center">
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "manager" ? "bg-primary" : "bg-info text-dark"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 🧩 Add/Edit User Modal */}
      {showModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editUser ? "✏️ Edit User (Password Reset Supported)" : "➕ Add New User"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
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
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* 🟢 Password Reset Field */}
                  <div className="mb-3">
                    <label>
                      {editUser ? "Reset Password (optional)" : "Password"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={
                        editUser
                          ? "(Leave blank to keep old password)"
                          : "Enter password"
                      }
                      required={!editUser}
                    />
                    {editUser && (
                      <small className="text-muted">
                        Leave this field empty if you don’t want to reset password.
                      </small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label>Role</label>
                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    {editUser ? "Update User" : "Add User"}
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
