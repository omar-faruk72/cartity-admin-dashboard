/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoRefreshOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoCartOutline,
  IoPeopleOutline,
  IoPulseOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoListOutline,
  IoBagHandleOutline,
} from "react-icons/io5";
import { BASE_URL } from "@/app/helper/BASE_URL";

const COLORS = ["#8BB496", "#5E81F4", "#F4BE5E", "#FF808B", "#7FB3FF"];

const DashboardOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/dashboard/admin-overview`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        withCredentials: true,
      });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "revenue":
        return <IoWalletOutline className="text-green-600" />;
      case "orders":
        return <IoCartOutline className="text-blue-600" />;
      case "customers":
        return <IoPeopleOutline className="text-purple-600" />;
      case "avg":
        return <IoPulseOutline className="text-orange-600" />;
      default:
        return <IoPulseOutline />;
    }
  };

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
  );

  return (
    <div className=" min-h-screen space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Analytics</h1>
          <p className="text-xs text-gray-500">
            Real-time performance overview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
            <IoCalendarOutline className="text-gray-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="text-[12px] font-medium outline-none cursor-pointer"
            />
            <span className="text-gray-300 text-xs">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="text-[12px] font-medium outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border text-[12px] font-medium shadow-sm hover:bg-gray-50"
          >
            <IoRefreshOutline className={loading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
        </div>
      </div>

      {/* 1. Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          : (data?.headerStats || []).map((item: any, index: number) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-tight">
                    {item.label}
                  </p>
                  <div className="p-2 bg-gray-50 rounded-lg text-xl">
                    {getIcon(item.icon)}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {item.value}
                </h3>
                <div
                  className={`flex items-center gap-1 text-[11px] font-bold ${item.growth >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {item.growth >= 0 ? (
                    <IoTrendingUpOutline />
                  ) : (
                    <IoTrendingDownOutline />
                  )}
                  {Math.abs(item.growth)}%{" "}
                  <span className="text-gray-400 font-normal ml-1">
                    vs prev. period
                  </span>
                </div>
              </div>
            ))}
      </div>

      {/* 2. Middle Informational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          <>
            <Link
              href="/admin/orders?status=Pending"
              className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100">
                  <IoTimeOutline className="text-xl text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {data?.middleStats?.pendingOrders}
                  </h3>
                  <p className="text-[12px] font-medium text-gray-400">
                    Pending Orders
                  </p>
                </div>
              </div>
              <IoChevronForwardOutline className="text-gray-300 group-hover:text-orange-500" />
            </Link>

            <Link
              href="/admin/products?filter=low-stock"
              className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-red-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100">
                  <IoAlertCircleOutline className="text-xl text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {data?.middleStats?.lowStockProducts}
                  </h3>
                  <p className="text-[12px] font-medium text-gray-400">
                    Low Stock Items
                  </p>
                </div>
              </div>
              <IoChevronForwardOutline className="text-gray-300 group-hover:text-red-500" />
            </Link>

            <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <IoCheckmarkCircleOutline className="text-xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {data?.middleStats?.orderSuccessRate || 0}%
                  </h3>
                  <p className="text-[12px] font-medium text-gray-400">
                    Order Success Rate
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-6">
            Revenue Overview
          </h4>
          <div className="h-[300px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.revenueOverview || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F2F2F2"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: "#F9FAFB" }} />
                  <Bar
                    dataKey="revenue"
                    fill="#8BB496"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-1">
            Sales by Category
          </h4>
          <div className="h-56 relative mt-4">
            {loading ? (
              <Skeleton className="h-full w-full rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.salesByCategory || []}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(data?.salesByCategory || []).map(
                      (_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            {!loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold">100%</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest">
                  Total Sales
                </span>
              </div>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {!loading &&
              (data?.salesByCategory || []).map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[12px]"
                >
                  <div className="flex items-center gap-2 text-gray-500">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    ></div>
                    <span className="capitalize">{item.category}</span>
                  </div>
                  <span className="font-bold text-gray-800">{item.value}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 4. Recent Orders Table (Full Width) */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <IoBagHandleOutline className="text-lg text-[#8BB496]" /> Recent
            Orders
          </h4>
          <Link
            href="/dashboard/orders"
            className="text-[11px] font-bold text-[#8BB496] hover:underline flex items-center gap-1"
          >
            View All <IoChevronForwardOutline />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="pb-4 font-semibold">Order ID</th>
                <th className="pb-4 font-semibold">Customer</th>
                <th className="pb-4 font-semibold">Date</th>
                <th className="pb-4 font-semibold">Amount</th>
                <th className="pb-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="py-4">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                : (data?.recentOrders || []).map((order: any, i: number) => (
                    <tr
                      key={i}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 text-[12px] font-bold text-gray-800">
                        #{order.orderId}
                      </td>
                      <td className="py-4 text-[12px] text-gray-600">
                        {order.customer}
                      </td>
                      <td className="py-4 text-[12px] text-gray-400">
                        {new Date(order.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="py-4 text-[12px] font-bold text-gray-900">
                        {order.amount}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === "Delivered"
                              ? "bg-green-50 text-green-600"
                              : order.status === "Pending"
                                ? "bg-orange-50 text-orange-600"
                                : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-6 flex items-center gap-2">
            <IoListOutline /> Status Breakdown
          </h4>
          <div className="space-y-5">
            {loading ? [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8 w-full" />) :
              (data?.orderStatusBreakdown || []).map((status: any, i: number) => {
                const barColor = status.color.replace("text-", "bg-");
                const totalInBreakdown = (data?.orderStatusBreakdown || []).reduce((acc: number, curr: any) => acc + curr.count, 0);
                const percentage = totalInBreakdown > 0 ? (status.count / totalInBreakdown) * 100 : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-gray-500">{status.label}</span>
                      <span className={`${status.color} font-bold`}>{status.count}</span>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full opacity-70 ${barColor}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div> */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-6 flex items-center gap-2">
            <IoListOutline /> Status Breakdown
          </h4>
          <div className="space-y-5">
            {loading
              ? [1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))
              : (data?.orderStatusBreakdown || []).map(
                  (status: any, i: number) => {
                    // কালার ম্যাপিং লজিক
                    const colorMap: any = {
                      Delivered: "#10B981", // Green
                      Shipped: "#3B82F6", // Blue
                      Processing: "#8B5CF6", // Purple
                      Pending: "#F97316", // Orange
                      Cancelled: "#EF4444", // Red
                    };

                    const activeColor = colorMap[status.label] || "#9CA3AF"; // ডিফল্ট গ্রে যদি না মেলে
                    const totalInBreakdown = (
                      data?.orderStatusBreakdown || []
                    ).reduce((acc: number, curr: any) => acc + curr.count, 0);
                    const percentage =
                      totalInBreakdown > 0
                        ? (status.count / totalInBreakdown) * 100
                        : 0;

                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className="text-gray-500">{status.label}</span>
                          {/* টেক্সট কালার ইনলাইন স্টাইলে */}
                          <span
                            className="font-bold"
                            style={{ color: activeColor }}
                          >
                            {status.count}
                          </span>
                        </div>
                        <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                          {/* ব্যাকগ্রাউন্ড কালার ইনলাইন স্টাইলে */}
                          <div
                            className="h-full opacity-70 transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: activeColor,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  },
                )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-6">
            Top Selling Products
          </h4>
          <div className="space-y-4">
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              : (data?.topProducts || []).map((product: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover bg-gray-50"
                      />
                      <div>
                        <p className="text-[11px] font-bold text-gray-800 truncate w-36 group-hover:text-[#8BB496]">
                          {product.name}
                        </p>
                        <p className="text-[9px] text-gray-400">
                          {product.sales} sold •{" "}
                          <span className="font-bold text-gray-700">
                            {product.amount}
                          </span>
                        </p>
                      </div>
                    </div>
                    <IoChevronForwardOutline className="text-gray-200 text-xs" />
                  </div>
                ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-6">
            Orders by City
          </h4>
          <div className="space-y-6">
            {loading
              ? [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))
              : (data?.ordersByCity || []).map((item: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-gray-600">
                        {item.city}
                      </span>
                      <span className="text-gray-400 text-[10px] font-bold">
                        {item.orders} orders ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5E81F4] h-full transition-all duration-700"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
