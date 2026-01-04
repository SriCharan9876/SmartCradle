import { Bell, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../services/api";


export default function Navbar({ isOpen, toggleSidebar }) {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        let lastSeenId = null;

        const checkNotifications = async () => {
            try {
                const data = await apiFetch("/api/notifications");

                // Count unread
                const unread = data.filter(n => !n.is_read).length;
                setUnreadCount(unread);

                // Check for new notification to toast
                if (data.length > 0) {
                    const latest = data[0];
                    // If we have a previous sync check and this ID is different (assumed newer)
                    // Note: Ideally compare timestamps or IDs. comparing ID string inequality for simplicity if strictly ordered.
                    if (lastSeenId && latest.id !== lastSeenId) {
                        toast.info(latest.message || "New Notification", {
                            position: "bottom-right",
                            autoClose: 5000,
                            theme: "dark"
                        });
                    }
                    lastSeenId = latest.id;
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        checkNotifications(); // Initial check
        const interval = setInterval(checkNotifications, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, [user]);

    return (
        <header className={`h-16 border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl fixed top-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 transition-all duration-300 left-0 ${isOpen ? "md:left-64" : "md:left-16"}`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors -ml-2"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/notifications" className="p-2 text-neutral-400 hover:text-white transition-colors relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border border-neutral-900"></span>
                    )}
                </Link>
                <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{user?.display_name || user?.email || "User"}</p>
                        <p className="text-xs text-neutral-500">Member</p>
                    </div>
                    <Link to="/profile" className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-emerald-500/50 transition-all overflow-hidden">
                        {user?.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
