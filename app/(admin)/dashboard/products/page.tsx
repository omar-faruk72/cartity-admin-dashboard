/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  IoSearchOutline,
  IoAdd,
  IoEllipsisHorizontal,
  IoCubeOutline,
  IoWarningOutline,
  IoBanOutline,
  IoTrashOutline,
  IoPencilOutline,
} from "react-icons/io5";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Skeleton from "react-loading-skeleton"; // Import Skeleton
import "react-loading-skeleton/dist/skeleton.css"; // CSS ইমপোর্ট
import Swal from "sweetalert2";
import { BASE_URL } from "@/app/helper/BASE_URL";
import { useModalStore } from "@/app/store/useModalStore";
import AddProductModal from "@/app/modals/AddProductModal";
import UpdateProductModal from "@/app/modals/UpdateProductModal";

interface Product {
  _id: string;
  name: string;
  thumbnail: string;
  categoryID?: { name: string };
  salePrice: number;
  regularPrice: number;
  stock: number;
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { onOpen } = useModalStore();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/products?page=${currentPage}&searchTerm=${searchTerm}&category=${selectedCategory}`,
      );

      if (response.data.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.meta.totalPage);
        setTotalProducts(response.data.meta.total);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load products from server");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories`);
      if (response.data.success) setCategories(response.data.data);
    } catch (error) {
      console.error("Category Error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setActiveMenu(null);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "rounded-2xl" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${BASE_URL}/products/${id}`, {
            withCredentials: true,
          });
          if (response.data.success) {
            Swal.fire({ title: "Deleted!", icon: "success", timer: 1500, showConfirmButton: false });
            fetchProducts();
          }
        } catch (error) {
          Swal.fire({ title: "Error!", text: "Something went wrong.", icon: "error" });
        }
      }
    });
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const getStatusBadge = (stock: number) => {
    const style = "text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap";
    if (stock === 0) return <span className={`${style} bg-red-50 text-red-600`}>Out of Stock</span>;
    if (stock < 10) return <span className={`${style} bg-yellow-50 text-yellow-600`}>Low Stock</span>;
    return <span className={`${style} bg-green-50 text-green-600`}>Active</span>;
  };

  return (
    <div className="space-y-6 font-sans pb-10 w-full" onClick={() => setActiveMenu(null)}>
      <AddProductModal categories={categories} refreshProducts={fetchProducts} />
      <UpdateProductModal categories={categories} refreshProducts={fetchProducts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
       
         <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
          <p className="text-xs text-gray-500"> Inventory & Catalog Control</p>
        </div>
        <button
          onClick={() => onOpen("addProduct")}
          className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest font-black shadow-lg shadow-black/10 active:scale-95 transition-all"
        >
          <IoAdd className="text-lg" /> Add Product
        </button>
      </div>

      {/* Stat Cards with Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard label="Total Products" value={totalProducts} icon={<IoCubeOutline />} loading={loading} />
        <StatCard label="Low Stock" value={products.filter((p) => p.stock < 10 && p.stock > 0).length} icon={<IoWarningOutline />} color="text-yellow-500" loading={loading} />
        <StatCard label="Out of Stock" value={products.filter((p) => p.stock === 0).length} icon={<IoBanOutline />} color="text-red-500" loading={loading} />
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:max-w-md">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-black/10 transition-all placeholder:text-gray-400"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full lg:w-48 bg-gray-50 border-none rounded-lg px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat: any) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Product Table with Skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <th className="px-6 py-5 text-center">Thumbnail</th>
                <th className="px-6 py-5">Name & ID</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Sale Price</th>
                <th className="px-6 py-5">Stock</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 flex justify-center"><Skeleton width={48} height={48} borderRadius={8} /></td>
                    <td className="px-6 py-4"><Skeleton width={150} height={15} /><Skeleton width={80} height={8} /></td>
                    <td className="px-6 py-4"><Skeleton width={80} /></td>
                    <td className="px-6 py-4"><Skeleton width={50} /></td>
                    <td className="px-6 py-4"><Skeleton width={40} /></td>
                    <td className="px-6 py-4"><Skeleton width={60} height={20} borderRadius={20} /></td>
                    <td className="px-6 py-4 text-center"><Skeleton circle width={30} height={30} /></td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/30 transition-colors whitespace-nowrap">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 mx-auto shadow-sm">
                        <img src={product.thumbnail} className="w-full h-full object-cover" alt="" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.name}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">ID: {product._id.slice(-8)}</p>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">{product.categoryID?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">${product.salePrice}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4">{getStatusBadge(product.stock)}</td>
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
                        <div className="absolute right-10 top-12 w-36 bg-white shadow-2xl rounded-xl border border-gray-100 z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button onClick={() => onOpen("editProduct", { product })} className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 text-gray-700">
                            <IoPencilOutline size={16} /> Edit
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2 hover:bg-red-50">
                            <IoTrashOutline size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center py-24 text-gray-400 italic text-xs font-medium">No products matched your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {loading ? <Skeleton width={100} /> : <>Showing <span className="text-black">{products.length}</span> of <span className="text-black">{totalProducts}</span> Items</>}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-all text-gray-500"
            >
              <FiChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? "bg-[#F3E8EC] text-[#8B3D52]" : "text-gray-400 hover:bg-gray-50"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages || loading}
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

// StatCard Interface Update
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = "text-gray-400", loading }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-all group">
    <div className="flex justify-between items-center">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">{label}</p>
      <span className={`text-xl ${color} bg-gray-50 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300`}>{icon}</span>
    </div>
    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">
      {loading ? <Skeleton width={40} /> : value}
    </h3>
  </div>
);

export default ProductPage;