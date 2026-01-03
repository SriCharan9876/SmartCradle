import { useState } from "react";
import { apiFetch } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [display_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ display_name, email, password }),
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side - Visual Panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative justify-center items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Register Visual"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 p-12 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Join Smart Cradle</h1>
          <p className="text-lg text-slate-300">
            Create an account to start monitoring your child's safety with advanced AI analytics.
          </p>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="mt-2 text-slate-600">Join us to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none bg-white text-slate-900"
                placeholder="John Doe"
                value={display_name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none bg-white text-slate-900"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none bg-white text-slate-900"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Register
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
