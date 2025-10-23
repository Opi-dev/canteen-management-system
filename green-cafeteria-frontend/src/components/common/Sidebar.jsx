import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  // ✅ Sidebar items by role
  const renderLinks = () => {
    if (user?.role === "admin") {
      return (
        <>
          <li>
            <a className="nav-link text-white" href="/admin/dashboard">🏠 Dashboard</a>
          </li>
          <li>
            <a className="nav-link text-white" href="/admin/users">👥 Manage Users</a>
          </li>
          <li>
            <a className="nav-link text-white" href="/admin/menu-list">📋 Menu Items</a>
          </li>
          <li>
            <a className="nav-link text-white" href="/admin/add-menu">➕ Add Menu</a>
          </li>
          <li>
            <a className="nav-link text-white" href="/admin/orders">🧾 Orders</a>
          </li>
          <li>
            <a className="nav-link text-white" href="/admin/stock">📦 Stock</a>
          </li>
          <li>
            <a className="nav-link text-white" href="/admin/reports">📊 Reports</a>
          </li>
        </>
      );
    }

    // ✅ Updated Manager Section
    if (user?.role === "manager") {
      return (
        <>
          <li>
            <a className="nav-link" href="/manager/dashboard">🏠 Dashboard</a>
          </li>
          <li>
            <a className="nav-link" href="/manager/menu-list">📋 Menu Items</a>
          </li>
          <li>
            <a className="nav-link" href="/manager/add-menu">➕ Add Menu</a>
          </li>
          <li>
            <a className="nav-link" href="/manager/orders">🧾 Orders</a>
          </li>
          <li>
            <a className="nav-link" href="/manager/stock">📦 Stock</a>
          </li>
          <li>
            <a className="nav-link" href="/manager/reports">📊 Reports</a>
          </li>
        </>
      );
    }

    if (user?.role === "staff") {
      return (
        <>
          <li>
            <a className="nav-link text-white" href="/staff/dashboard">🏠 Dashboard</a>
          </li>
          <li>
            <a className="nav-link text-white" href="/staff/orders">🧾 My Orders</a>
          </li>
          <li>
            <a className="nav-link text-white" href="/staff/menu">🍱 Menu</a>
          </li>
        </>
      );
    }

    return null;
  };

  return (
    <div
      className="d-flex flex-column p-3 bg-dark text-white position-fixed"
      style={{ width: "250px", height: "100vh" }}
    >
      <h5 className="text-success mb-4 text-center">🌿 Green Cafeteria</h5>
      <ul className="nav nav-pills flex-column mb-auto">{renderLinks()}</ul>
      <div className="mt-auto text-center small text-muted">
        © 2025 Green Cafeteria
      </div>
    </div>
  );
}
