import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Baby, ChevronRight, ChevronLeft, X, User } from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar }) {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: User, label: "Profile", path: "/profile" },
        // Add more items here as needed
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-neutral-900 border-r border-white/5 flex flex-col z-50 transition-all duration-300 
            ${isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-16 md:translate-x-0"}
            `}
        >
            <div className={`p-6 ${isOpen ? "" : "md:px-2"}`}>
                <div className={`flex items-center gap-3 mb-8 ${isOpen ? "px-2" : "md:justify-center"}`}>
                    <div className="min-w-10 min-h-10 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Baby className="text-white" size={24} />
                    </div>
                    {isOpen && (
                        <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-lg bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent whitespace-nowrap">
                                Smart Cradle
                            </span>
                            {/* Close button for mobile */}
                            <button onClick={toggleSidebar} className="md:hidden text-neutral-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <nav className="space-y-1.5">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive(item.path)
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "text-neutral-400 hover:text-white hover:bg-white/5"
                                } ${!isOpen && "md:justify-center md:px-2"}`}
                            onClick={() => {
                                // Close sidebar on mobile when a link is clicked
                                if (window.innerWidth < 768) toggleSidebar();
                            }}
                        >
                            <item.icon
                                size={20}
                                className={`transition-colors duration-300 min-w-[20px] ${isActive(item.path)
                                    ? "text-emerald-400"
                                    : "text-neutral-500 group-hover:text-emerald-400"
                                    }`}
                            />
                            {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto py-4 px-2 border-t border-white/5 hidden md:block">
                <button
                    onClick={toggleSidebar}
                    className={`flex items-center gap-4 py-2 w-full rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300 group ${isOpen ? "px-6" : "justify-center px-2"
                        }`}
                    title={!isOpen ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
                    {isOpen && <span className="font-medium whitespace-nowrap">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
