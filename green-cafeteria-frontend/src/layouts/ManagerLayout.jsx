import React from "react";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

export default function ManagerLayout({ children }) {
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
        {children}
      </div>
    </div>
  );
}
