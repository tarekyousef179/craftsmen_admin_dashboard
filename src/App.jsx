import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Craftsmen from "./pages/Craftsmen";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/Login";
import RootRedirect from "./pages/RootRedirect";
import { ThemeProvider } from "./contexts/themeContext.jsx";
import OverviewPage from "./pages/Overview";
import { UserProvider } from "./contexts/UserContext";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <UserProvider>
            <Routes>
              <Route path="/" element={<RootRedirect />} />

              <Route path="/login" element={<AdminLogin />} />

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<OverviewPage />} />
                <Route path="/users" element={<Users />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/craftsmen" element={<Craftsmen />} />
                <Route path="/services" element={<Services />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </UserProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
