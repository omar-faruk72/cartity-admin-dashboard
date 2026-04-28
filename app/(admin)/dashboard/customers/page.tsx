/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  IoSearchOutline,
  IoReloadOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoBanOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BASE_URL } from "@/app/helper/BASE_URL";

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      // API call with params
      const response = await axios.get(`${BASE_URL}/customers`, {
        params: {
          page: currentPage,
          limit: 10,
          searchTerm: searchTerm,
          status: statusFilter === "all" ? "" : statusFilter,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setCustomers(response.data.data.customers);
        setStats(response.data.data.stats);
        setPagination(response.data.meta);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      const response = await axios.patch(
        `${BASE_URL}/customers/${id}/status`,
        { status: newStatus },
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success(`User status updated to ${newStatus}`);
        fetchCustomers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-xs text-gray-500">
            {" "}
            Manage and monitor your customer base
          </p>
        </div>
        <button
          onClick={() => fetchCustomers()}
          className="p-2 hover:rotate-180 transition-all duration-500 text-gray-400 bg-gray-50 rounded-full"
        >
          <IoReloadOutline size={18} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={stats?.totalCustomers}
          icon={<IoPeopleOutline />}
          color="text-blue-500"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={stats?.active}
          icon={<IoCheckmarkCircleOutline />}
          color="text-green-500"
          loading={loading}
        />
        <StatCard
          label="Blocked"
          value={stats?.blocked}
          icon={<IoBanOutline />}
          color="text-red-500"
          loading={loading}
        />
        <StatCard
          label="New This Month"
          value={stats?.newThisMonth}
          icon={<IoCalendarOutline />}
          color="text-purple-500"
          loading={loading}
        />
      </div>

      {/* Filters & Search Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-black/5 outline-none transition-all placeholder:text-gray-400"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // সার্চ করলে আবার ১ নম্বর পেজে নিয়ে যাবে
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="hidden lg:block text-[10px] font-black uppercase text-gray-400 whitespace-nowrap">
            Filter By:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full lg:w-40 bg-gray-50 border-none rounded-lg py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-black/5 cursor-pointer appearance-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Contact</th>

                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5">Joined Date</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <Skeleton height={35} borderRadius={8} />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <IoPeopleOutline size={40} className="text-gray-100" />
                      <span className="text-gray-400 italic text-xs font-medium">
                        No customers found matching your criteria
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer: any) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50/40 transition-colors whitespace-nowrap"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={customer.avatar?.url}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <div
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${customer.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 tracking-tight leading-none mb-1">
                            {customer.firstName} {customer.lastName}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                            {customer._id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">
                          {customer.email}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">
                          {customer.phoneNumber || "No Phone"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border-2 ${
                          customer.status === "active"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <IoCalendarOutline className="text-gray-300" />
                        <span className="text-[11px] font-bold">
                          {new Date(customer.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          handleStatusChange(customer._id, customer.status)
                        }
                        className={`text-[9px] px-5 py-2.5 rounded-full font-black uppercase tracking-widest transition-all shadow-sm ${
                          customer.status === "active"
                            ? "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border-red-100"
                            : "bg-black text-white hover:bg-zinc-800"
                        }`}
                      >
                        {customer.status === "active" ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          {/* Left Side: Showing Info */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-black">{customers.length}</span> of{" "}
            <span className="text-black">{pagination?.total || 0}</span>{" "}
            Customers
          </p>

          {/* Right Side: Page Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-all text-gray-500"
            >
              <FiChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {[...Array(pagination?.totalPage || 1)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                      currentPage === pageNum
                        ? "bg-[#F3E8EC] text-[#8B3D52] shadow-sm shadow-[#8B3D52]/5" // আপনার দেওয়া সলিড স্টাইল
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              disabled={currentPage === pagination?.totalPage || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-all text-gray-500"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ label, value, icon, color, loading }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group">
    <div className="flex justify-between items-start mb-3">
      <div
        className={`p-2.5 rounded-xl bg-gray-50 ${color} group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none">
        {loading ? <Skeleton width={40} /> : value || 0}
      </span>
    </div>
    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
      {label}
    </p>
  </div>
);

export default CustomerPage;
