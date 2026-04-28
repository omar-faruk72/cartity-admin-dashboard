/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  IoCloseOutline, 
  IoCloudUploadOutline 
} from "react-icons/io5";

import { useModalStore } from "../store/useModalStore";
import { BASE_URL } from "../helper/BASE_URL";

const CategoryModal = ({ fetchCategories }: { fetchCategories: () => void }) => {
  
  const { isOpen, type, onClose } = useModalStore();
  
  const [catName, setCatName] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  
  const isModalOpen = isOpen && type === "addCategory";

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setCatName("");
    setSelectedImage(null);
    setPreview(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!catName || !selectedImage) {
      toast.error("Please provide both name and image");
      return;
    }

    setBtnLoading(true);
    const formData = new FormData();
    formData.append("name", catName);
    formData.append("image", selectedImage);

    try {
      const { data } = await axios.post(`${BASE_URL}/categories/create-category`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Category created successfully!");
        fetchCategories(); 
        handleClose();     
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setBtnLoading(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleClose}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white w-[95%] sm:w-full sm:max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Add New Category</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
              Category Name
            </label>
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Skin Care"
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-black transition-all text-sm bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
              Upload Image
            </label>
            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative group">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center px-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <IoCloudUploadOutline size={30} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Click to upload or drag</p>
                  <p className="text-[10px] text-gray-300 mt-1">PNG, JPG (Max. 2MB)</p>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                onChange={handleImageChange} 
                accept="image/*" 
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={btnLoading}
              className="w-full sm:flex-1 bg-black text-white px-6 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg order-1 sm:order-2"
            >
              {btnLoading ? "Processing..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;