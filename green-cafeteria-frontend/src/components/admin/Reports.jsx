import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import api from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

export default function Reports() {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Helper Function for Safe Number Formatting
  const formatAmount = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // ✅ Fetch Reports (Daily + Monthly)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [dailyRes, monthlyRes] = await Promise.all([
          api.get("/reports/daily", { headers }),
          api.get("/reports/monthly", { headers }),
        ]);

        setDaily(dailyRes.data);
        setMonthly(monthlyRes.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ✅ Export Monthly PDF
  const exportMonthlyPDF = () => {
    if (!monthly) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Green Cafeteria - Monthly Sales Report", 14, 15);
    doc.setFontSize(11);
    doc.text(`Month: ${monthly?.month || "-"}`, 14, 25);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    const tableData =
      monthly?.daily_sales?.map((s) => [
        s.date,
        `৳${formatAmount(s.total)}`,
      ]) || [];

    autoTable(doc, {
      head: [["Date", "Total Sales (৳)"]],
      body: tableData,
      startY: 40,
      styles: { halign: "center" },
      headStyles: { fillColor: [40, 167, 69] },
    });

    doc.save("Monthly_Sales_Report.pdf");
  };

  // ✅ Export CSV/Excel
  const exportCSV = () => {
    if (!monthly) return;

    const headers = "Date,Total Sales (৳)\n";
    const rows =
      monthly?.daily_sales
        ?.map((s) => `${s.date},${formatAmount(s.total)}`)
        .join("\n") || "";

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8",
    });
    saveAs(blob, "Monthly_Sales_Report.csv");
  };

  // ✅ Export Today's Sales PDF (with logo & signature)
  const exportTodayPDF = async () => {
    if (!daily) return;

    const doc = new jsPDF();

    // 🔹 Add logo from public folder
    const logoUrl = "/logo192.png";
    const logo = await fetch(logoUrl)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          })
      );

    // ✅ Header
    doc.addImage(logo, "PNG", 14, 8, 20, 20);
    doc.setFontSize(16);
    doc.text("Green Cafeteria", 40, 18);
    doc.setFontSize(11);
    doc.text("House 12, Green Road, Dhaka - 1205", 40, 24);
    doc.text(
      "Email: info@greencafeteria.com | Phone: +880 1729 646743",
      40,
      29
    );

    // 🔹 Divider
    doc.line(14, 32, 195, 32);

    // ✅ Title & Date
    doc.setFontSize(14);
    doc.text("📅 Today's Sales Report", 14, 42);
    doc.setFontSize(11);
    doc.text(
      `Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`,
      14,
      50
    );

    // ✅ Table
    autoTable(doc, {
      startY: 58,
      head: [["Metric", "Value"]],
      body: [
        ["Total Sales", `৳${formatAmount(daily?.total_sales)}`],
        ["Total Orders", daily?.total_orders || 0],
      ],
      theme: "striped",
      styles: { halign: "center" },
    });

    // ✅ Footer Signature
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(11);
    doc.text("Authorized Signature", 150, pageHeight - 20);
    doc.line(140, pageHeight - 22, 190, pageHeight - 22);

    doc.save("Todays_Sales_Report.pdf");
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
        <h3 className="text-success mb-4">📊 Sales Reports</h3>

        {loading ? (
          <p>Loading reports...</p>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : (
          <>
            {/* ✅ Summary Cards */}
            <div className="row mb-4">
              {/* 🔹 Today's Sales */}
              <div className="col-md-4">
                <div className="card shadow-sm text-center border-success">
                  <div className="card-body">
                    <h5>Today's Sales</h5>
                    <h3 className="text-success">
                      ৳{formatAmount(daily?.total_sales)}
                    </h3>
                    <p className="text-muted">
                      Total Orders: {daily?.total_orders || 0}
                    </p>
                    <button
                      onClick={exportTodayPDF}
                      className="btn btn-outline-danger btn-sm mt-2"
                    >
                      📄 Export Today’s PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* 🔹 Monthly Summary */}
              <div className="col-md-8">
                <div className="card shadow-sm border-info">
                  <div className="card-body text-center">
                    <h5>Monthly Sales Summary</h5>
                    <h6 className="text-muted mb-2">
                      ({monthly?.month || "N/A"})
                    </h6>
                    <h4 className="text-info">
                      ৳{formatAmount(monthly?.total_sales)}
                    </h4>

                    <div className="mt-3">
                      <button
                        onClick={exportMonthlyPDF}
                        className="btn btn-danger me-2"
                      >
                        📄 Export Monthly PDF
                      </button>
                      <button onClick={exportCSV} className="btn btn-success">
                        📊 Export CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Sales Chart */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="text-center mb-3">📅 Daily Sales Chart</h5>
                {monthly?.daily_sales?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthly.daily_sales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#28a745"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted">
                    No completed orders found for this month.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
