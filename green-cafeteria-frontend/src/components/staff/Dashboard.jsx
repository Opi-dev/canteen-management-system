import React from "react";
import StaffLayout from "../../layouts/StaffLayout";

export default function Dashboard() {
  return (
    <StaffLayout>
      <div className="container mt-4">
        <h3 className="text-success mb-3">👨‍🍳 Staff Dashboard</h3>
        <p>Welcome! Manage orders and track your daily completion statistics.</p>

        <div className="row mt-4">
          {/* Pending Orders Card */}
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-primary text-center h-100">
              <div className="card-body">
                <h5 className="card-title">Pending Orders</h5>
                <p className="text-muted">
                  View all orders waiting to be completed.
                </p>
                <a href="/staff/orders" className="btn btn-primary">
                  View Orders
                </a>
              </div>
            </div>
          </div>

          {/* Daily Stats Card */}
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-success text-center h-100">
              <div className="card-body">
                <h5 className="card-title">Daily Stats</h5>
                <p className="text-muted">
                  Check your daily order completion statistics.
                </p>
                <a href="/staff/stats" className="btn btn-success">
                  View Stats
                </a>
              </div>
            </div>
          </div>

          {/* Menu Access Card */}
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-warning text-center h-100">
              <div className="card-body">
                <h5 className="card-title">Menu</h5>
                <p className="text-muted">
                  Browse the cafeteria menu and available items.
                </p>
                <a href="/staff/menu" className="btn btn-warning">
                  View Menu
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
