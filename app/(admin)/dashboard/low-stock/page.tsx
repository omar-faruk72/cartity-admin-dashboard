"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  IoCubeOutline,
  IoWarningOutline,
  IoPencilOutline,
  IoEllipsisHorizontal,
} from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useModalStore } from "@/app/store/useModalStore";
import { BASE_URL } from "@/app/helper/BASE_URL";
import UpdateProductModal from "@/app/modals/UpdateProductModal";


interface Product {
  _id: string;
  name: string;
  thumbnail: string;
  categoryID?: { name: string };
  salePrice: number;
  stock: number;
  lowStockAlert: number;
}

const LowStockPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { onOpen } = useModalStore();

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      // আপনার নতুন এপিআই এন্ডপয়েন্ট
      const response = await axios.get(`${BASE_URL}/products/low-stock`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  return (
    <div className="space-y-6 font-sans pb-10 w-full" onClick={() => setActiveMenu(null)}>
      {/* মডাল রিফ্রেশ লজিক সহ */}
      <UpdateProductModal categories={[]} refreshProducts={fetchLowStock} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Alerts</h1>
          <p className="text-xs text-gray-500">Products reaching critical stock levels</p>
        </div>
      </div>

      {/* Stat Card - আপনার ডিজাইন অনুযায়ী */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Items to Restock" 
          value={products.length} 
          icon={<IoWarningOutline />} 
          color="text-yellow-500" 
          loading={loading} 
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <th className="px-6 py-5 text-center">Thumbnail</th>
                <th className="px-6 py-5">Name & ID</th>
                <th className="px-6 py-5">Current Stock</th>
                <th className="px-6 py-5">Alert Level</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 flex justify-center"><Skeleton width={48} height={48} borderRadius={8} /></td>
                    <td className="px-6 py-4"><Skeleton width={150} height={15} /></td>
                    <td className="px-6 py-4"><Skeleton width={40} /></td>
                    <td className="px-6 py-4"><Skeleton width={40} /></td>
                    <td className="px-6 py-4"><Skeleton width={50} /></td>
                    <td className="px-6 py-4"><Skeleton width={70} height={20} borderRadius={20} /></td>
                    <td className="px-6 py-4 text-center"><Skeleton circle width={30} height={30} /></td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/30 transition-colors whitespace-nowrap">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 mx-auto">
                        <img src={product.thumbnail} className="w-full h-full object-cover" alt="" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{product.name}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase">ID: {product._id.slice(-8)}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-sm font-black ${product.stock === 0 ? 'text-red-500' : 'text-yellow-600'}`}>
                         {product.stock} Units
                       </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">
                      Alert at: {product.lowStockAlert}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">${product.salePrice}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${product.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === product._id ? null : product._id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                      >
                        <IoEllipsisHorizontal size={18} />
                      </button>
                      {activeMenu === product._id && (
                        <div className="absolute right-10 top-12 w-36 bg-white shadow-2xl rounded-xl border border-gray-100 z-50 py-1">
                          <button 
                            onClick={() => onOpen("editProduct", { product })} 
                            className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                          >
                            <IoPencilOutline size={16} /> Update Stock
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-24 text-gray-400 italic text-xs">
                    All products are well-stocked.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const StatCard = ({ label, value, icon, color, loading }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 group">
    <div className="flex justify-between items-center">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">{label}</p>
      <span className={`text-xl ${color} bg-gray-50 p-2.5 rounded-xl group-hover:scale-110 transition-transform`}>{icon}</span>
    </div>
    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">
      {loading ? <Skeleton width={40} /> : value}
    </h3>
  </div>
);

export default LowStockPage;