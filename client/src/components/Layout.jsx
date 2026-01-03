import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-neutral-950">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <Navbar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className={`pt-16 min-h-screen transition-all duration-300 pl-0 ${isSidebarOpen ? "md:pl-64" : "md:pl-16"}`}>
                {children || <Outlet />}
            </main>
        </div>
    );
}
