// ✅ Imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// ✅ Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// ✅ Admin Components
import AdminDashboard from "./components/admin/Dashboard";
import Users from "./components/admin/Users";
import MenuList from "./components/admin/MenuList";
import AddMenu from "./components/admin/AddMenu";
import Orders from "./components/admin/Orders";
import Stock from "./components/admin/Stock";
import Reports from "./components/admin/Reports"; // ✅ Added Reports

// ✅ Manager & Staff Components
import ManagerDashboard from "./components/manager/Dashboard";
import ManagerMenuList from "./components/manager/MenuList"; // ✅ Added
import ManagerAddMenu from "./components/manager/AddMenu"; // ✅ Added
import ManagerOrders from "./components/manager/Orders"; // ✅ Added
import ManagerStock from "./components/manager/Stock"; // ✅ Added
import ManagerReports from "./components/manager/Reports"; // ✅ Added

import StaffDashboard from "./components/staff/Dashboard";
import StaffOrders from "./components/staff/Orders"; // ✅ Added StaffOrders

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ✅ Login Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* ✅ Role-based Dashboards */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/orders" element={<StaffOrders />} /> {/* ✅ Added */}

          {/* ✅ Manager Extra Pages */}
          <Route path="/manager/menu-list" element={<ManagerMenuList />} /> {/* ✅ Added */}
          <Route path="/manager/add-menu" element={<ManagerAddMenu />} /> {/* ✅ Added */}
          <Route path="/manager/orders" element={<ManagerOrders />} /> {/* ✅ Added */}
          <Route path="/manager/stock" element={<ManagerStock />} /> {/* ✅ Added */}
          <Route path="/manager/reports" element={<ManagerReports />} /> {/* ✅ Added */}

          {/* ✅ Admin Extra Pages */}
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/menu-list" element={<MenuList />} />
          <Route path="/admin/add-menu" element={<AddMenu />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/stock" element={<Stock />} />
          <Route path="/admin/reports" element={<Reports />} /> {/* ✅ Added */}

          {/* ✅ 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
