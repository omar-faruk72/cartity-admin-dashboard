/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */


"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import slugify from "slugify";
import CreatableSelect from "react-select/creatable"; // পরিবর্তিত

import {
  IoCloseOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoImagesOutline,
  IoPricetagOutline,
  IoSyncOutline,
  IoCartOutline,
  IoTrashOutline,
  IoAddOutline,
  IoGridOutline,
} from "react-icons/io5";
import { useModalStore } from "../store/useModalStore";
import { BASE_URL } from "../helper/BASE_URL";
import { UpdateProductModalProps } from "../types/modal.types";


const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  categories: externalCategories,
  refreshProducts,
}) => {
  const { isOpen, type, data: modalData, onClose } = useModalStore();
  const product = modalData?.product;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);


  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    brand: "",
    costPrice: "",
    regularPrice: "",
    salePrice: "",
    stock: "",
    sku: "",
    categoryID: "",
    isFeatured: false,
    isNew: true,
    freeShipping: false,
    status: "active",
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

 
  useEffect(() => {
    if (!isOpen) return;

    if (externalCategories && externalCategories.length > 0) {
      setCategories(externalCategories);
    } else {
      const fetchCategories = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/categories`);
          if (res.data.success) {
            const options = res.data.data.map((cat: any) => ({
              value: cat._id,
              label: cat.name,
            }));
            setCategories(options);
          }
        } catch (err) {
          console.error(" Error fetching categories:", err);
        }
      };
      fetchCategories();
    }
  }, [isOpen, externalCategories, type]);

  // এডিট মোডে ডাটা পপুলেট করা
  useEffect(() => {
    if (isOpen && type === "editProduct" && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        slug: product.slug || "",
        brand: product.brand || "",
        costPrice: product.costPrice?.toString() || "",
        regularPrice: product.regularPrice?.toString() || "",
        salePrice: product.salePrice?.toString() || "",
        stock: product.stock?.toString() || "",
        sku: product.sku || "",
        categoryID: product.categoryID?._id || product.categoryID || "",
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        freeShipping: product.freeShipping || false,
        status: product.status || "active",
      });

      // ট্যাগ স্ট্রিং অ্যারে থেকে রিঅ্যাক্ট-সিলেক্ট অবজেক্টে রূপান্তর
      if (product.tags) {
        setTags(product.tags.map((t: string) => ({ label: t, value: t })));
      } else {
        setTags([]);
      }

      setThumbnailPreview(product.thumbnail || null);
      setGalleryPreviews(product.images || []);
      setGalleryImages([]);
      setThumbnail(null);
    }
  }, [isOpen, type, product]);

  if (!isOpen || type !== "editProduct") return null;

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type: inputType } = target;
    const finalValue = inputType === "checkbox" ? target.checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: finalValue };
      if (name === "name")
        updated.slug = slugify(value, { lower: true, strict: true });
      return updated;
    });
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (galleryPreviews.length + files.length > 8)
      return toast.error("Max 8 images allowed");
    setGalleryImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews((prev) => [...prev, ...previews]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    const totalExisting = product?.images?.length || 0;
    if (index >= totalExisting) {
      const newFileIndex = index - totalExisting;
      setGalleryImages((prev) => prev.filter((_, i) => i !== newFileIndex));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();

 
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });

    
    const tagsArray = tags.map((t) => t.value);
    data.append("tags", JSON.stringify(tagsArray));

    if (thumbnail) data.append("thumbnail", thumbnail);
    galleryImages.forEach((img) => data.append("images", img));

    try {
      await axios.patch(`${BASE_URL}/products/${product._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("Product updated successfully!");
      refreshProducts();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle =
    "block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2";
  const inputStyle =
    "w-full bg-gray-50 border-gray-100 border p-4 rounded-xl text-sm outline-none focus:border-black transition-all";
  const sectionTitleStyle =
    "text-lg font-bold flex items-center gap-2 text-gray-800";

  const ToggleRow = ({
    label,
    name,
    checked,
  }: {
    label: string;
    name: string;
    checked: boolean;
  }) => (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={handleInputChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-gray-50 w-full max-w-7xl h-full sm:h-auto max-h-[95vh] shadow-2xl rounded-none sm:rounded-[24px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-[110]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-600 transition-all"
            >
              <IoCloseOutline size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Update Product</h2>
          </div>
          <button
            type="submit"
            form="updateForm"
            disabled={loading}
            className="flex items-center gap-2.5 bg-black text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-black/10"
          >
            <IoSyncOutline
              className={loading ? "animate-spin" : ""}
              size={16}
            />
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>

        <form
          id="updateForm"
          onSubmit={handleSubmit}
          className="p-8 overflow-y-auto space-y-8 no-scrollbar"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10">
            <div className="space-y-8">
              <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-6 shadow-sm">
                <h3 className={sectionTitleStyle}>
                  <IoPricetagOutline className="text-gray-400" /> Basic
                  Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>Product Title</label>
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyle}>Slug (Read Only)</label>
                      <input
                        readOnly
                        name="slug"
                        value={formData.slug}
                        className={`${inputStyle} bg-gray-100 text-gray-400 cursor-not-allowed`}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Brand Name</label>
                      <input
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Description</label>
                    <textarea
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className={`${inputStyle} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Media Assets */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoImageOutline className="text-gray-400" /> Media Assets
                </h3>
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                  <div className="shrink-0 space-y-3">
                    <label className={labelStyle}>Master Thumbnail *</label>
                    <label className="flex flex-col items-center justify-center w-[260px] h-[260px] border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative group bg-gray-50/50">
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <IoCloudUploadOutline
                            size={32}
                            className="text-gray-300 mb-2"
                          />
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Upload Main Photo
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="sr-only"
                        onChange={handleThumbnailChange}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-3">
                    <label className={`${labelStyle} flex items-center gap-2`}>
                      <IoImagesOutline /> Gallery Collection
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {galleryPreviews.map((src, index) => (
                        <div
                          key={index}
                          className="relative w-full aspect-square rounded-xl overflow-hidden group border border-gray-100 shadow-sm bg-white"
                        >
                          <img
                            src={src}
                            className="w-full h-full object-cover"
                            alt="gallery"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <IoTrashOutline size={10} />
                          </button>
                        </div>
                      ))}
                      {galleryPreviews.length < 10 && (
                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all bg-gray-50/30 group">
                          <IoAddOutline
                            size={20}
                            className="text-gray-300 group-hover:text-black transition-colors"
                          />
                          <input
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleGalleryChange}
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-6 shadow-sm">
                <h3 className={sectionTitleStyle}>
                  <IoCartOutline className="text-gray-400" /> Inventory & Price
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>Regular Price</label>
                    <input
                      type="number"
                      name="regularPrice"
                      value={formData.regularPrice}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Sale Price</label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                  </div>
                </div>
              </div>
              {/* category  */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoGridOutline className="text-gray-400" /> Store
                  Categorization
                </h3>

                {/* Primary Category */}
                <div className="space-y-2">
                  <label className={labelStyle}>Primary Category *</label>
                  <div className="relative group">
                    <select
                      required
                      name="categoryID"
                      value={formData.categoryID}
                      onChange={handleInputChange}
                      className={`${inputStyle} cursor-pointer appearance-none pr-12 transition-all duration-300 focus:ring-2 focus:ring-black/5`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1.25rem center",
                        backgroundSize: "1.2em",
                      }}
                    >
                      <option value="" className="text-gray-400">
                        Select Categories
                      </option>
                      {categories.map((cat: any) => (
                        <option
                          key={cat.value || cat._id}
                          value={cat.value || cat._id}
                          className="text-gray-800 py-2"
                        >
                          {cat.label || cat.name}
                        </option>
                      ))}
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-10 pointer-events-none border-r border-gray-100 my-3 mr-10"></div>
                  </div>
                </div>

                {/* Search Tags (এখানে CreatableSelect ব্যবহার করা হয়েছে) */}
                <div className="space-y-2">
                  <label className={labelStyle}>Search Tags</label>
                  <CreatableSelect
                    isMulti
                    placeholder="Type tag and press enter..."
                    value={tags}
                    // onChange={(newValue) => setTags(newValue || [])}
                    onChange={(newValue) =>
                      setTags(newValue as { label: string; value: string }[])
                    }
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: "#F9FAFB",
                        borderColor: "#F3F4F6",
                        borderRadius: "0.75rem",
                        padding: "4px",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#E5E7EB" },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#000000",
                        borderRadius: "8px",
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: "#FFFFFF",
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 6px",
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: "#FFFFFF",
                        "&:hover": {
                          backgroundColor: "#FF4444",
                          color: "white",
                          borderRadius: "0 8px 8px 0",
                        },
                      }),
                    }}
                    components={{ DropdownIndicator: null }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <ToggleRow
                  label="Featured Product"
                  name="isFeatured"
                  checked={formData.isFeatured}
                />
                <ToggleRow
                  label="New Arrival"
                  name="isNew"
                  checked={formData.isNew}
                />
                <ToggleRow
                  label="Free Shipping"
                  name="freeShipping"
                  checked={formData.freeShipping}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductModal;
