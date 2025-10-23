import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      className="navbar navbar-light bg-light shadow-sm"
      style={{ marginLeft: "250px" }}
    >
      <div className="container-fluid justify-content-between">
        <h5 className="m-0 text-success">Dashboard</h5>

        <div className="d-flex align-items-center">
          <span className="me-3">
            👤 {user?.name} ({user?.role})
          </span>
          <button onClick={logout} className="btn btn-outline-danger btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
