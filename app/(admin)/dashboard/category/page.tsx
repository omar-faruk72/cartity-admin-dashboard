/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  IoAddOutline,
  IoTrashOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoReloadOutline,
} from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Swal from "sweetalert2";
import { BASE_URL } from "@/app/helper/BASE_URL";
import { useModalStore } from "@/app/store/useModalStore";
import CategoryModal from "@/app/modals/CategoryModal";

interface Category {
  _id: string;
  name: string;
  image: string;
}

interface FetchResponse {
  success: boolean;
  data: Category[];
  totalPages: number;
  totalCategories: number;
}

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { onOpen } = useModalStore();

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCategories, setTotalCategories] = useState<number>(0);

  const fetchCategories = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { data } = await axios.get<FetchResponse>(
        `${BASE_URL}/categories?page=${currentPage}&limit=8`,
      );
      if (data.success) {
        setCategories(data.data);
        setTotalPages(data.totalPages);
        setTotalCategories(data.totalCategories);
      }
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string): Promise<void> => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "rounded-2xl" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await axios.delete<{
            success: boolean;
            message?: string;
          }>(`${BASE_URL}/categories/${id}`, { withCredentials: true });
          if (data.success) {
            Swal.fire({
              title: "Deleted!",
              text: "Category has been deleted.",
              icon: "success",
              confirmButtonColor: "#000000",
            });
            fetchCategories();
          }
        } catch (err: any) {
          Swal.fire({
            title: "Error!",
            text: err.response?.data?.message || "Delete failed",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="space-y-6 font-sans pb-10 w-full overflow-x-hidden">
      <CategoryModal fetchCategories={fetchCategories} />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Category Management
          </h1>
          <p className="text-xs text-gray-500">
            {" "}
            Organize your products by collection
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchCategories()}
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:rotate-180 transition-all duration-500 shadow-sm"
          >
            <IoReloadOutline size={18} />
          </button>
          <button
            onClick={() => onOpen("addCategory")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-black/10 active:scale-95"
          >
            <IoAddOutline size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <th className="px-6 py-5">Preview</th>
                <th className="px-6 py-5">Collection Details</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                // Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <Skeleton width={56} height={56} borderRadius={12} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton width={120} height={14} className="mb-2" />
                      <Skeleton width={80} height={8} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton circle width={32} height={32} />
                    </td>
                  </tr>
                ))
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-gray-50/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm group">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-800 text-sm tracking-tight">
                        {cat.name}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-0.5 font-bold uppercase tracking-tighter">
                        UUID: {cat._id.slice(-8)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
                      >
                        <IoTrashOutline size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-gray-50 rounded-full text-gray-200">
                        <IoAddOutline size={40} />
                      </div>
                      <p className="text-gray-400 italic text-xs font-medium">
                        No collections found in database
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Updated Pagination (Glowly TS Style) */}
        <div className="p-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {loading ? (
              <Skeleton width={100} />
            ) : (
              <>
                Showing <span className="text-black">{categories.length}</span>{" "}
                of <span className="text-black">{totalCategories}</span>{" "}
                Collections
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-95"
            >
              <IoChevronBackOutline size={16} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                    currentPage === i + 1
                      ? "bg-[#F3E8EC] text-[#8B3D52] shadow-sm shadow-[#8B3D52]/5"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-95"
            >
              <IoChevronForwardOutline size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
