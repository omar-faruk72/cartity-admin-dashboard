/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  IoSearchOutline,
  IoCartOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoStatsChartOutline,
  IoReloadOutline,
  IoBanOutline,
  IoRocketOutline
} from "react-icons/io5";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton"; // Import Skeleton
import "react-loading-skeleton/dist/skeleton.css"; // CSS ইমপোর্ট করতে ভুলবেন না

import { useModalStore } from "@/app/store/useModalStore";
import { BASE_URL } from "@/app/helper/BASE_URL";
import OrderStatusModal from "@/app/modals/OrderStatusModal";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState<any>({});
  const [stats, setStats] = useState<any>({}); 
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { onOpen } = useModalStore();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/order/all-orders?page=${currentPage}&search=${searchTerm}`,
        { withCredentials: true },
      );
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setStats(response.data.data.stats);
        setPagination(response.data.meta);
      }
    } catch (error: any) {
      console.error("Order Fetch Error:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "bg-yellow-50 text-yellow-600 border-yellow-100",
      Processing: "bg-blue-50 text-blue-600 border-blue-100",
      Shipped: "bg-purple-50 text-purple-600 border-purple-100",
      Delivered: "bg-green-50 text-green-600 border-green-100",
      Cancelled: "bg-red-50 text-red-600 border-red-100",
    };
    return (
      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border whitespace-nowrap ${styles[status] || "bg-gray-50 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans pb-10 w-full overflow-x-hidden">
      <OrderStatusModal fetchOrders={fetchOrders} />

      <div className="flex justify-between items-center">
        
         <div>
          <h1 className="text-2xl font-bold text-gray-800">
             Order Management
          </h1>
          <p className="text-xs text-gray-500">
            {" "}
            Order Control
          </p>
        </div>
        <button 
          onClick={() => fetchOrders()}
          className="p-2 hover:rotate-180 transition-all duration-500 text-gray-400"
        >
          <IoReloadOutline size={20} />
        </button>
      </div>

      {/* Stats Cards with Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard label="Total" value={stats?.total} icon={<IoCartOutline />} loading={loading} />
        <StatCard label="Pending" value={stats?.pending} icon={<IoStatsChartOutline />} color="text-yellow-500" loading={loading} />
        <StatCard label="Processing" value={stats?.processing} icon={<IoTimeOutline />} color="text-blue-500" loading={loading} />
        <StatCard label="Shipped" value={stats?.shipped} icon={<IoRocketOutline />} color="text-purple-500" loading={loading} />
        <StatCard label="Delivered" value={stats?.delivered} icon={<IoCheckmarkCircleOutline />} color="text-green-500" loading={loading} />
        <StatCard label="Cancelled" value={stats?.cancelled} icon={<IoBanOutline />} color="text-red-500" loading={loading} />
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by Customer Name or Email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-black/5 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           {loading ? <Skeleton width={120} /> : `Showing ${orders.length} of ${pagination?.total || 0} Orders`}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Items</th>
                <th className="px-6 py-5">Total</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                // Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><Skeleton width={80} /></td>
                    <td className="px-6 py-5"><Skeleton width={150} height={15} /><Skeleton width={100} height={10} /></td>
                    <td className="px-6 py-5"><Skeleton width={100} /></td>
                    <td className="px-6 py-5"><Skeleton width={40} /></td>
                    <td className="px-6 py-5"><Skeleton width={60} /></td>
                    <td className="px-6 py-5 text-center"><Skeleton width={70} height={20} borderRadius={20} /></td>
                    <td className="px-6 py-5 text-center"><Skeleton width={80} height={30} borderRadius={20} /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-24 text-gray-400 italic font-medium">No orders matching your criteria.</td></tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50/40 transition-colors whitespace-nowrap">
                    <td className="px-6 py-5 font-bold text-gray-400 text-[10px] uppercase">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 tracking-tight">{order.firstName} {order.lastName}</span>
                        <span className="text-[10px] text-gray-400 lowercase">{order.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-500 text-xs font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                       <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        {order.cartItems?.length || 0} PKG
                       </span>
                    </td>
                    <td className="px-6 py-5 font-black text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => onOpen("updateOrderStatus", order)}
                        className="bg-black text-white text-[9px] px-6 py-2.5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-800 active:scale-95 transition-all shadow-md shadow-black/5"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {loading ? <Skeleton width={100} /> : <>Page <span className="text-black">{pagination?.page || 1}</span> of <span className="text-black">{pagination?.totalPage || 1}</span></>}
          </p>
          <div className="flex items-center gap-3">
            <button
              disabled={pagination?.page <= 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2.5 border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-20 transition-all"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              disabled={pagination?.page >= pagination?.totalPage || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2.5 border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-20 transition-all"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color = "text-black", loading }: any) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-gray-200 transition-all group">
    <div className="flex justify-between items-center">
      <span className={`text-lg ${color} bg-gray-50 p-2 rounded-lg group-hover:scale-110 transition-transform`}>{icon}</span>
      <h3 className="text-xl font-bold text-gray-900">
        {loading ? <Skeleton width={40} /> : value || 0}
      </h3>
    </div>
    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
  </div>
);

export default OrderPage;