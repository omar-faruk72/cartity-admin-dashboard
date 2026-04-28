/* eslint-disable react-hooks/static-components */
"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IoCubeOutline,
  IoCartOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoNotificationsOutline,
  IoStatsChartOutline,
  IoCopyOutline,
  IoOpenOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/authContext";
import ProtectedRoute from "@/app/shared/ProtectedRoute";
import { useSettings } from "@/app/helper/useSettings";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutUser } = useAuth();
  const { data: settings, isLoading } = useSettings();

  const menuItems = [
    { name: "Overview", icon: <IoStatsChartOutline />, path: "/dashboard" },
    { name: "Category", icon: <IoCubeOutline />, path: "/dashboard/category" },
    { name: "Products", icon: <IoCubeOutline />, path: "/dashboard/products" },
    { name: "Orders", icon: <IoCartOutline />, path: "/dashboard/orders" },
    { name: "Analytics", icon: <IoCartOutline />, path: "/dashboard/analytics" },
    { name: "Customers", icon: <IoPeopleOutline />, path: "/dashboard/customers" },
    { name: "Settings", icon: <IoSettingsOutline />, path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  const handleCopyLink = () => {
    const url = settings?.siteURL || window.location.origin;
    navigator.clipboard.writeText(url);
    toast.success("Website link copied!");
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Admin";

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#F9F3F5] p-6">
      <div className="mb-10 flex justify-center">
        <Link href="/">
          <img
            src={settings?.logo}
            alt="Logo"
            className="w-32 h-auto object-contain"
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 px-4 py-3 w-full border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all"
      >
        <IoLogOutOutline className="text-lg" />
        Logout
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFCFD] font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50 border-r border-gray-100">
        <SidebarContent />
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-2xl p-1 hover:bg-gray-100 rounded-md"
              onClick={() => setIsSidebarOpen(true)}
            >
              <IoMenuOutline />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Visit Website & Copy Link - Responsive hide on extra small screens */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <Link
                href={settings?.siteURL || "/"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] md:text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
              >
                <IoOpenOutline className="text-sm" />
                <span className="hidden md:inline">Visit Site</span>
              </Link>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleCopyLink}
                className="text-[11px] md:text-xs font-semibold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <IoCopyOutline className="text-sm" />
                <span className="hidden md:inline">Copy Link</span>
              </button>
            </div>

            <button className="text-xl text-gray-500 hover:text-black relative p-1">
              <IoNotificationsOutline />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Section */}
            <div className="flex items-center gap-2 md:gap-3 border-l pl-3 md:pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{fullName}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mt-1">
                  {user?.role === "admin" ? "Super Admin" : "Staff"}
                </p>
              </div>

              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={
                    user?.avatar?.url && user.avatar.url.trim() !== ""
                      ? user.avatar.url
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`
                  }
                  className="w-full h-full object-cover"
                  alt="profile"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=888&color=fff`;
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8 w-full">
          <ProtectedRoute allowRoles={["admin"]}>
            <div className="max-w-full overflow-hidden">
              {children}
            </div>
          </ProtectedRoute>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <button
              className="absolute top-4 -right-12 text-3xl text-white hover:text-gray-200"
              onClick={() => setIsSidebarOpen(false)}
            >
              <IoCloseOutline />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;