import { useState, useRef, useEffect } from "react";
import { X, Lock, Trash2, Key, Loader, ShieldCheck, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SecurityPopup({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState("VERIFY"); // VERIFY | MANAGE
    const [otp, setOtp] = useState("");
    const [securityToken, setSecurityToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Manage Tabs
    const [activeTab, setActiveTab] = useState("PASSWORD"); // PASSWORD | DELETE

    // Password Fields
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const otpInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setStep("VERIFY");
            setOtp("");
            setError("");
            setSuccessMsg("");
            setSecurityToken(null);
            setNewPassword("");
            setConfirmPassword("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSendOTP = async () => {
        setLoading(true);
        setError("");
        try {
            await apiFetch("/api/auth/send-otp-security", { method: "POST" });
            setSuccessMsg(`OTP sent to ${user.email}`);
            otpInputRef.current?.focus();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await apiFetch("/api/auth/verify-otp-security", {
                method: "POST",
                body: JSON.stringify({ otp })
            });
            setSecurityToken(data.securityToken);
            setStep("MANAGE");
            setSuccessMsg("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await apiFetch("/api/auth/change-password", {
                method: "PUT",
                body: JSON.stringify({ newPassword, securityToken })
            });
            setSuccessMsg("Password changed successfully. Please login again.");
            setTimeout(() => {
                logout();
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you SURE you want to delete your account? This action is IRREVERSIBLE.")) {
            return;
        }

        setLoading(true);
        setError("");
        try {
            await apiFetch("/api/auth/delete-account", {
                method: "DELETE", // Changed from POST to DELETE per best practices and route def
                headers: { "Content-Type": "application/json" }, // Explicitly set content type for body if needed, though apiFetch handles it usually. Wait, DELETE with body? Standard allows it, but creating a controller that reads body.
                body: JSON.stringify({ securityToken })
            });
            logout();
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={24} />
                        Security Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === "VERIFY" ? (
                        <div className="space-y-6">
                            <p className="text-neutral-300 text-sm">
                                To access sensitive security settings, verify your identity by entering the OTP sent to <strong>{user.email}</strong>.
                            </p>

                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Mail size={16} />
                                {loading ? "Sending..." : "Send OTP"}
                            </button>

                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Enter OTP</label>
                                    <input
                                        ref={otpInputRef}
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full mt-1 px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white text-center tracking-[0.5em] text-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                {error && <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</p>}
                                {successMsg && <p className="text-emerald-400 text-sm bg-emerald-500/10 p-2 rounded">{successMsg}</p>}

                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading && <Loader size={18} className="animate-spin" />}
                                    Verify & Proceed
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Tabs */}
                            <div className="flex border-b border-white/10">
                                <button
                                    onClick={() => { setActiveTab("PASSWORD"); setError(""); setSuccessMsg(""); }}
                                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "PASSWORD" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-neutral-400 hover:text-white"}`}
                                >
                                    Change Password
                                </button>
                                <button
                                    onClick={() => { setActiveTab("DELETE"); setError(""); setSuccessMsg(""); }}
                                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "DELETE" ? "text-red-400 border-b-2 border-red-400" : "text-neutral-400 hover:text-white"}`}
                                >
                                    Delete Account
                                </button>
                            </div>

                            {error && <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</p>}
                            {successMsg && <p className="text-emerald-400 text-sm bg-emerald-500/10 p-2 rounded">{successMsg}</p>}

                            {activeTab === "PASSWORD" && (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-neutral-400">New Password</label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-3 top-3 text-neutral-500" />
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                                    placeholder="Enter new password"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-neutral-400">Confirm Password</label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-3 top-3 text-neutral-500" />
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                        Update Password
                                    </button>
                                </form>
                            )}

                            {activeTab === "DELETE" && (
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                                        <Trash2 size={32} className="text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Delete Account?</h3>
                                    <p className="text-neutral-400 text-sm">
                                        This action is <strong>irreversible</strong>. All your data, cradles, and history will be permanently erased.
                                    </p>

                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={loading}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        Yes, Delete My Account
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function Save({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
    )
}
