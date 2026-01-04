import { User, Mail, Shield, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EditProfilePopup from "../components/EditProfilePopup";
import SecurityPopup from "../components/SecurityPopup";

import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);

    // Fallback if user is null (though should be handled by loading or Private route)
    if (!user) {
        return <div className="p-12 text-white">Loading profile...</div>;
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                    <p className="text-neutral-400">Manage your account settings and preferences</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-neutral-900 border border-white/5 rounded-2xl p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden relative">
                        {user?.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-white" />
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-1">
                        <h2 className="text-2xl font-bold text-white">{user.display_name || "User"}</h2>
                        <div className="flex flex-col md:flex-row items-center gap-4 text-neutral-400 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Mail size={14} />
                                <span>{user.email}</span>
                            </div>
                            <div className="hidden md:block w-1 h-1 bg-neutral-700 rounded-full"></div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-800 rounded-full border border-white/5">
                                <Shield size={12} className="text-emerald-400" />
                                <span className="text-emerald-400 font-medium text-xs">{user.provider || "local"}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 bg-white text-neutral-900 font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Settings size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Preferences</h3>
                    </div>
                    <p className="text-neutral-400 text-sm mb-4">
                        Manage your notification settings, theme preferences, and dashboard layout.
                    </p>
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                        Manage Preferences →
                    </button>
                </div>

                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Shield size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Security</h3>
                    </div>
                    <p className="text-neutral-400 text-sm mb-4">
                        Update your password, manage your account security, or permanently delete your account.
                    </p>
                    <button
                        onClick={() => setIsSecurityOpen(true)}
                        className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                    >
                        Security Settings →
                    </button>
                </div>
            </div>

            <EditProfilePopup
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
            />

            <SecurityPopup
                isOpen={isSecurityOpen}
                onClose={() => setIsSecurityOpen(false)}
            />
        </div >
    );
}

