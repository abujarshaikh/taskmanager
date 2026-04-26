import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ROLES } from "./api/constants";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import DashboardPage  from "./pages/DashboardPage";
import ProfilePage    from "./pages/ProfilePage";
import AnalyticsPage  from "./pages/AnalyticsPage";
import NotFoundPage   from "./pages/NotFoundPage";
import PrivateRoute   from "./components/PrivateRoute";

import TasksPage       from "./pages/admin/TasksPage";
import CreateTaskPage  from "./pages/admin/CreateTaskPage";
import UserStatsPage   from "./pages/admin/UserStatsPage";
import SuggestionsPage from "./pages/admin/SuggestionsPage";
import ActivityLogPage from "./pages/admin/ActivityLogPage";

function PublicRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={role === ROLES.ADMIN ? "/admin/analytics" : "/dashboard"} replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  return (
    <PrivateRoute requiredRole={ROLES.ADMIN}>
      {children}
    </PrivateRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<Navigate to="/login" replace />} />
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* User */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

            {/* Admin — redirect /admin to analytics */}
            <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />

            {/* Admin pages */}
            <Route path="/admin/analytics"   element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
            <Route path="/admin/tasks"        element={<AdminRoute><TasksPage /></AdminRoute>} />
            <Route path="/admin/create-task"  element={<AdminRoute><CreateTaskPage /></AdminRoute>} />
            <Route path="/admin/users"        element={<AdminRoute><UserStatsPage /></AdminRoute>} />
            <Route path="/admin/suggestions"  element={<AdminRoute><SuggestionsPage /></AdminRoute>} />
            <Route path="/admin/activity"     element={<AdminRoute><ActivityLogPage /></AdminRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
