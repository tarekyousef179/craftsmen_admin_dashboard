import { useState } from "react";

import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router";

const AdminLogin = () => {
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (user && user.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        type: "internal",
      });
      console.log(res.data.data);
      const { token, user } = res.data.data;
      if (user.role !== "admin") {
        setErrorMsg("You are not authorized as admin.");
        setLoading(false);
        return;
      }
      login(token, user);
    } catch (error) {
      setErrorMsg(error.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="w-full max-w-md shadow-2xl rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]">
        <div className="p-8 text-[var(--color-card-foreground)]">
          <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-1 text-[var(--color-muted-foreground)]">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-[var(--color-muted-foreground)]">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMsg && (
              <div className="text-[var(--color-destructive)] text-sm mb-2">
                {errorMsg}
              </div>
            )}
            <div className="mt-6 text-center">
              <button
                className="w-full px-4 py-2 rounded bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:bg-[var(--color-primary-600)] transition-colors"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
