import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import api from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // 🔹 Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          return;
        }

        // 🔸 Orders Data
        const ordersRes = await api.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const totalOrders = ordersRes.data.length;
        const totalRevenue = ordersRes.data
          .filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

        // 🔸 Users Data
        const usersRes = await api.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 🔸 Menu Items Data (for stock info)
        const menuRes = await api.get("/menu-items", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const lowStock = menuRes.data.filter(
          (item) => item.stock_quantity <= 5
        );

        // 🔸 Sales Chart Data (last 7 days)
        const dailySales = {};
        ordersRes.data.forEach((o) => {
          const date = new Date(o.created_at).toLocaleDateString("en-GB");
          if (o.status === "completed") {
            dailySales[date] =
              (dailySales[date] || 0) + parseFloat(o.total_price);
          }
        });

        const chartData = Object.entries(dailySales).map(([date, total]) => ({
          date,
          total,
        }));

        // 🔸 Update States
        setStats({
          totalOrders,
          totalRevenue,
          totalUsers: usersRes.data.length,
          lowStockCount: lowStock.length,
        });

        setRecentOrders(ordersRes.data.slice(-5).reverse());
        setLowStockItems(lowStock);
        setSalesData(chartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div>
      {/* Sidebar */}
      <Sidebar />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div
        className="p-4"
        style={{
          marginLeft: "250px",
          marginTop: "70px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <h3 className="text-success fw-bold mb-4">🌿 Admin Dashboard</h3>

        {/* ✅ Stats Cards */}
        <div className="row text-center mb-4">
          {[
            { label: "Total Orders", value: stats.totalOrders, color: "text-primary" },
            { label: "Total Revenue", value: `৳${stats.totalRevenue}`, color: "text-success" },
            { label: "Active Users", value: stats.totalUsers, color: "text-info" },
            { label: "Low Stock", value: stats.lowStockCount, color: "text-danger" },
          ].map((card, idx) => (
            <div key={idx} className="col-md-3 mb-3">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6 className="text-muted">{card.label}</h6>
                  <h4 className={`fw-bold ${card.color}`}>{card.value}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Sales Chart */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-success text-white fw-bold">
            📈 Weekly Sales Overview
          </div>
          <div className="card-body">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#198754" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted">No sales data found.</p>
            )}
          </div>
        </div>

        {/* ✅ Recent Orders */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-primary text-white fw-bold">
            🧾 Recent Orders
          </div>
          <div className="card-body">
            {recentOrders.length === 0 ? (
              <p className="text-muted">No recent orders.</p>
            ) : (
              <table className="table table-bordered text-center">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.customer_name}</td>
                      <td>৳{o.total_price}</td>
                      <td>{o.payment_method}</td>
                      <td>
                        {o.status === "completed" ? (
                          <span className="badge bg-success">Completed</span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ✅ Low Stock Items */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-danger text-white fw-bold">
            ⚠ Low Stock Items
          </div>
          <div className="card-body">
            {lowStockItems.length === 0 ? (
              <p className="text-muted">No low stock items.</p>
            ) : (
              <table className="table table-striped text-center">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {item.stock_quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
