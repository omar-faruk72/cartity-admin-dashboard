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
} from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/authContext";
import ProtectedRoute from "@/app/shared/ProtectedRoute";
import { useSettings } from "@/app/helper/useSettings";


interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user";
  avatar: { url: string };
}

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
    {
      name: "Customers",
      icon: <IoPeopleOutline />,
      path: "/dashboard/customers",
    },
    {
      name: "Settings",
      icon: <IoSettingsOutline />,
      path: "/dashboard/settings",
    },
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

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Admin";
   if (isLoading) return <div>Loading logo...</div>;

  const SidebarContent = () => (
    
    <div className="flex flex-col h-full bg-[#F9F3F5] p-6">
      <div className="mb-10 flex justify-center">
        <Link href="/">
          <img
            src={settings?.logo}
            alt="Seoul Mirage"
            className="w-32 h-auto"
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
    <div className="flex min-h-screen bg-[#FDFCFD] font-sans overflow-x-hidden">
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-2xl p-1"
              onClick={() => setIsSidebarOpen(true)}
            >
              <IoMenuOutline />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-xl text-gray-500 hover:text-black relative">
              <IoNotificationsOutline />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{fullName}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                  {user?.role === "admin" ? "Super Admin" : "Staff"}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full border-2 border-gray-50 overflow-hidden bg-gray-100 flex items-center justify-center">
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

        <main className="p-4 md:p-8 w-full max-w-full overflow-x-hidden">
          <ProtectedRoute allowRoles={["admin"]}>
               {children}
          </ProtectedRoute>
       
        </main>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl transition-transform duration-300">
            <button
              className="absolute top-4 right-4 text-2xl"
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
