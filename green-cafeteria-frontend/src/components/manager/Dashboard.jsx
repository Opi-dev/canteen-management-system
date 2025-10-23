import React from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";

export default function ManagerDashboard() {
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
        <h3 className="text-success mb-3 text-center">
          📦 Manager Dashboard
        </h3>
        <p className="text-center text-muted">
          Welcome! Manage orders, stock, and menu availability here.
        </p>

        <div className="row mt-4">
          {/* Orders Section */}
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-primary text-center">
              <div className="card-body">
                <h5>Create & Manage Orders</h5>
                <p className="text-muted">View and create new orders easily.</p>
                <a href="/manager/orders" className="btn btn-primary">
                  Go to Orders
                </a>
              </div>
            </div>
          </div>

          {/* Stock Section */}
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-success text-center">
              <div className="card-body">
                <h5>Stock Management</h5>
                <p className="text-muted">
                  Update or view stock quantities and availability.
                </p>
                <a href="/manager/stock" className="btn btn-success">
                  Manage Stock
                </a>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-warning text-center">
              <div className="card-body">
                <h5>Sales Reports</h5>
                <p className="text-muted">Check daily sales and performance.</p>
                <a href="/manager/reports" className="btn btn-warning">
                  View Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
