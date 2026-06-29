import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./components/layout/MainLayout";
import Preloader from "./components/ui/Preloader";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import Roles from "./pages/Roles";
import CreateRole from "./pages/CreateRole";
import Employee from "./pages/Employee";
import CreateEmployee from "./pages/CreateEmployee";
import Customer from "./pages/Customer";
import CreateCustomer from "./pages/CreateCustomer";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import Building from "./pages/Building";
import CreateBuilding from "./pages/CreateBuilding";
import Component from "./pages/Component";
import CreateComponent from "./pages/CreateComponent";
import MaintenanceType from "./pages/MaintenanceType";
import CreateMaintenance from "./pages/CreateMaintenance";
import Logs from "./pages/Logs";
import Profile from "./pages/Profile";
import CustomerAdminDashboard from "./pages/CustomerAdminDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import EngineerScan from "./pages/EngineerScan";
import CreateLog from "./pages/CreateLog";
import BuildingDetail from "./pages/BuildingDetail";
import BuildingLogs from "./pages/BuildingLogs";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-react-calendars/styles/material.css";
function getStoredUser() {
  try {
    const user = localStorage.getItem("auth_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function getDashboardPathByRole() {
  const user = getStoredUser();
  const roleId = Number(user?.role_id);

  if (roleId === 1) {
    return "/dashboard";
  }

  if (roleId === 3) {
    return "/customer-dashboard";
  }

  return "/engineer-scan";
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

function AuthRoute({ children }) {
  const token = localStorage.getItem("auth_token");

  if (token) {
    return <Navigate to={getDashboardPathByRole()} replace />;
  }

  return children;
}

function LayoutRoute({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Preloader show={!loaded} />

      <Routes>
        {/* Default page open Sign In */}
        <Route 
        path="/" 
        element={
        <Navigate to="/signin" replace />}
         />

        {/* Auth - no layout */}
        <Route
          path="/signin"
          element={
            <AuthRoute>
              <SignIn />
            </AuthRoute>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="/engineer-scan" element={<EngineerScan />} />
       
        {/* Dashboard routes with sidebar layout */}
        <Route
          path="/dashboard"
          element={
            <LayoutRoute>
              <Dashboard />
            </LayoutRoute>
          }
        />

        <Route
          path="/customer-dashboard"
          element={
            <LayoutRoute>
              <CustomerAdminDashboard />
            </LayoutRoute>
          }
        />

        <Route
          path="/engineer-dashboard"
          element={
            <LayoutRoute>
              <EngineerDashboard />
            </LayoutRoute>
          }
        />

        <Route
          path="/create-log"
          element={
            <LayoutRoute>
              <CreateLog />
            </LayoutRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <LayoutRoute>
              <Roles />
            </LayoutRoute>
          }
        />

        <Route
          path="/create-role"
          element={
            <LayoutRoute>
              <CreateRole />
            </LayoutRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <LayoutRoute>
              <Employee />
            </LayoutRoute>
          }
        />

        <Route
          path="/create-employee"
          element={
            <LayoutRoute>
              <CreateEmployee />
            </LayoutRoute>
          }
        />

        <Route
          path="/customer"
          element={
            <LayoutRoute>
              <Customer />
            </LayoutRoute>
          }
        />

        <Route
          path="/create-customer"
          element={
            <LayoutRoute>
              <CreateCustomer />
            </LayoutRoute>
          }
        />

        <Route
          path="/building"
          element={
            <LayoutRoute>
              <Building />
            </LayoutRoute>
          }
        />

        <Route
          path="/create-building"
          element={
            <LayoutRoute>
              <CreateBuilding />
            </LayoutRoute>
          }
        />

        <Route
          path="/component"
          element={
            <LayoutRoute>
              <Component />
            </LayoutRoute>
          }
        />

        <Route
          path="/create-component"
          element={
            <LayoutRoute>
              <CreateComponent />
            </LayoutRoute>
          }
        />

        <Route
          path="/maintenance-type"
          element={
            <LayoutRoute>
              <MaintenanceType />
            </LayoutRoute>
          }
        />

        <Route
          path="/create-maintenance"
          element={
            <LayoutRoute>
              <CreateMaintenance />
            </LayoutRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <LayoutRoute>
              <Logs />
            </LayoutRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <LayoutRoute>
              <Profile />
            </LayoutRoute>
          }
        />
        <Route path="/building-logs" element={<BuildingLogs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
