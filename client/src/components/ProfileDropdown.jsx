import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileDropdown({ user, logout, isOpen, onClose }) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    ref={dropdownRef}
                    className="absolute right-0 top-14 w-64 bg-neutral-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 ring-1 ring-black/5"
                >
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-400 overflow-hidden shrink-0">
                                {user?.photo_url ? (
                                    <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.display_name || "User"}</p>
                                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        <Link
                            to="/profile"
                            onClick={onClose}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <User size={16} />
                            View Profile
                        </Link>
                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors mt-1 text-left"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
