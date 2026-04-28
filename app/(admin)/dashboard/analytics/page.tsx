/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  RefreshCcw,
  ArrowUpRight,
  Package,
  UserPlus,
  Star,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { BASE_URL } from "@/app/helper/BASE_URL";

// কালার প্যালেট (আপনার ইমেজের সাথে মিল রেখে)
const COLORS = [
  "#94b49f",
  "#7392f0",
  "#eac452",
  "#b35b91",
  "#8484f1",
  "#ff8042",
];

const AnalyticsPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/dashboard/analytics`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, [fetchAnalytics]);

  // মেইন চার্ট ডেটা প্রসেসিং
  const chartData =
    data?.revenueOverview?.map((item: any) => ({
      name: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][item._id - 1],
      revenue: item.revenue,
    })) || [];

  return (
    <div className="space-y-8 font-sans pb-10 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
              Analytics
          </h1>
          <p className="text-xs text-gray-500">
            {" "}
             Track store performance
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2.5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`৳${data?.stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          loading={loading}
          color="text-emerald-500"
        />
        <StatCard
          label="Total Orders"
          value={data?.stats.totalOrders}
          icon={<ShoppingBag size={20} />}
          loading={loading}
          color="text-blue-500"
        />
        <StatCard
          label="Total Customers"
          value={data?.stats.totalCustomers}
          icon={<Users size={20} />}
          loading={loading}
          color="text-indigo-500"
        />
        <StatCard
          label="New This Month"
          value={data?.stats.newThisMonth}
          icon={<TrendingUp size={20} />}
          loading={loading}
          color="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-tighter mb-6 italic">
            Revenue Overview
          </h3>
          <div className="h-[300px]">
            {loading ? (
              <Skeleton height="100%" borderRadius={15} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#94b49f"
                    radius={[4, 4, 0, 0]}
                    barSize={35}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales by Category (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-tighter mb-2 italic">
            Sales by Category
          </h3>
          <div className="h-[250px] relative">
            {loading ? (
              <Skeleton circle height={200} width={200} className="mx-auto" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data?.salesByCategory.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-xl font-black block">100%</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase">
                Total
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {data?.salesByCategory.map((cat: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center text-[10px] font-bold uppercase"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></div>
                  <span className="text-gray-500">{cat.category}</span>
                </div>
                <span>{cat.value} Sales</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xs font-black text-gray-800 uppercase italic">
              Top Products
            </h3>
            <ArrowUpRight size={14} className="text-gray-400" />
          </div>
          <div className="p-4 space-y-4">
            {data?.topProducts.map((product: any, i: number) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-300 w-4">
                    {i + 1}
                  </span>
                  <img
                    src={product.productInfo.thumbnail}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                  />
                  <div>
                    <p className="text-[11px] font-black text-gray-800 line-clamp-1">
                      {product.productInfo.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                      {product.sales} sales • ৳{product.amount}
                    </p>
                  </div>
                </div>
                <div className="w-20 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#94b49f]"
                    style={{
                      width: `${(product.sales / data.topProducts[0].sales) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-xs font-black text-gray-800 uppercase italic">
              Recent Activity
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {data?.recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex gap-4 relative">
                {i !== data.recentActivity.length - 1 && (
                  <div className="absolute left-4 top-8 w-[1px] h-10 bg-gray-100"></div>
                )}
                <div
                  className={`p-2 rounded-xl h-fit ${activity.type === "order" ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"}`}
                >
                  {activity.type === "order" ? (
                    <Package size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-800">
                    {activity.message}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                    {formatDistanceToNow(new Date(activity.time), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, loading, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-gray-200 transition-all">
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <h2 className="text-xl font-black text-gray-900 mt-1 italic">
        {loading ? <Skeleton width={80} /> : value}
      </h2>
      <p className="text-[8px] font-bold text-emerald-500 mt-1 uppercase">
        +12.5% vs last month
      </p>
    </div>
    <div
      className={`p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-500 ${color}`}
    >
      {icon}
    </div>
  </div>
);

export default AnalyticsPage;
