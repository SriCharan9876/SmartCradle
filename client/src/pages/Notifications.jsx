import { useState, useEffect } from "react";
import { apiFetch } from "../services/api"; // Assuming api service handles auth headers
import { Bell, Check, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await apiFetch("/api/notifications");
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllRead = async () => {
        try {
            await apiFetch("/api/notifications/read-all", { method: "PUT" });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error("Failed to mark all read", err);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen pt-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                    <p className="text-neutral-400">Alerts and updates from your cradles</p>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={markAllRead}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 bg-neutral-900/50 rounded-2xl border border-white/5">
                        <Bell size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`
                                relative overflow-hidden rounded-xl border p-4 transition-all duration-300
                                ${notification.is_read
                                    ? "bg-neutral-900/50 border-white/5 opacity-75"
                                    : "bg-neutral-800/80 border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
                                }
                            `}
                        >
                            <div className="flex gap-4">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                    ${notification.type === 'ANOMALY'
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-blue-500/10 text-blue-500"
                                    }
                                `}>
                                    {notification.type === 'ANOMALY' ? <AlertTriangle size={20} /> : <Info size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className={`font-semibold ${notification.is_read ? "text-neutral-300" : "text-white"}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-neutral-400 mt-1">{notification.message}</p>
                                        </div>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-1 hover:bg-white/10 rounded-full text-neutral-500 hover:text-emerald-500 transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
                                        <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                            {notification.cradle_name}
                                        </span>
                                        <span>•</span>
                                        <span>{format(new Date(notification.created_at), "MMM d, yyyy h:mm a")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
