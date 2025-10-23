import React, { useEffect, useState } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import api from "../../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // শুধুমাত্র pending অর্ডার রাখবো
        const pendingOrders = response.data.filter(
          (order) => order.status === "pending"
        );
        setOrders(pendingOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Voucher Code Verify করে Order Complete করা
  const markAsCompleted = async (order) => {
    const enteredCode = prompt(
      `Enter Voucher Code for Order #${order.id}:`
    );

    if (!enteredCode) {
      alert("⚠️ Please enter a voucher code.");
      return;
    }

    if (enteredCode.trim() !== order.voucher_code) {
      alert("❌ Invalid Voucher Code!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/orders/${order.id}`,
        { status: "completed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Order marked as completed!");
      setOrders(orders.filter((o) => o.id !== order.id));
    } catch (error) {
      console.error("Error updating order:", error);
      alert("❌ Failed to update order.");
    }
  };

  return (
    <StaffLayout>
      <h4 className="text-success mb-3">🧾 Pending Orders</h4>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="alert alert-warning text-center">
          No pending orders found.
        </div>
      ) : (
        <table className="table table-bordered table-striped shadow-sm">
          <thead className="table-success">
            <tr className="text-center">
              <th>ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Voucher</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="text-center">
                <td>{order.id}</td>
                <td>{order.customer_name}</td>
                <td>{order.items_count || "-"}</td>
                <td>৳{order.total_price}</td>
                <td>
                  <code>{order.voucher_code}</code>
                </td>
                <td>
                  <span className="badge bg-warning text-dark">
                    {order.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => markAsCompleted(order)}
                    className="btn btn-success btn-sm"
                  >
                    ✅ Complete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </StaffLayout>
  );
}
