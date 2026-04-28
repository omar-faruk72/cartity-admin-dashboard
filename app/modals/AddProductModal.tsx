/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import slugify from "slugify";
import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  IoCloseOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoImagesOutline,
  IoTrashOutline,
  IoGridOutline,
  IoPricetagOutline,
  IoSettingsOutline,
  IoSearchOutline,
  IoLayersOutline,
  IoCartOutline,
  IoRocketOutline,
  IoAddOutline,
} from "react-icons/io5";
import CreatableSelect from "react-select/creatable";
import { useModalStore } from "../store/useModalStore";
import { BASE_URL } from "../helper/BASE_URL";

interface Category {
  _id: string;
  name: string;
}

interface AddProductModalProps {
  categories: Category[];
  refreshProducts: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  categories,
  refreshProducts,
}) => {
  const { isOpen, type, onClose } = useModalStore();

  // tagsText এর পরিবর্তে values ব্যবহার করব
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);

  const handleTagChange = (newValue: any) => {
    setTags(newValue);
  };

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    description: "",
    slug: "",
    brand: "",

    // Pricing
    costPrice: "",
    regularPrice: "",
    salePrice: "",
    // discountPercent calculated on submit

    // Inventory
    stock: "",
    sku: "",
    lowStockAlert: "5",

    // Category
    categoryID: "",
    tagsText: "", // for multiple tags input

    // Flags
    isFeatured: false,
    isNew: true, // Default based on schema
    status: "active", // Default based on schema

    // Shipping
    shippingClass: "normal",
    freeShipping: false,
    shippingCostText: "",

    // SEO
    metaTitle: "",
    metaDescription: "",
  });

  const [advancedSpecs, setAdvancedSpecs] = useState<
    { key: string; value: string }[]
  >([]);

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  if (!isOpen || type !== "addProduct") return null;

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const finalValue = type === "checkbox" ? target.checked : value;

    setFormData((prev) => {
      const newData = { ...prev, [name]: finalValue };

      if (name === "name") {
        newData.slug = slugify(value, {
          lower: true,
          strict: true,
          trim: true,
        });
      }

      return newData;
    });
  };

  // const handleInputChange = (
  //   e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  // ) => {
  //   // Type assertion: target-ke HTMLInputElement hisebe cast koro
  //   const target = e.target as HTMLInputElement;
  //   const { name, value, type } = target;

  //   // Ekhon target.checked access korle TypeScript error dibe na
  //   const finalValue = type === "checkbox" ? target.checked : value;

  //   setFormData((prev) => ({ ...prev, [name]: finalValue }));
  // };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || []);
  //   if (files.length > 0) {
  //     setGalleryImages((prev) => [...prev, ...files]);
  //     const newPreviews = files.map((file) => URL.createObjectURL(file));
  //     setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  //   }
  // };
  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (galleryImages.length + files.length > 5) {
      return toast.error("You can only upload up to 5 gallery images.");
    }

    if (files.length > 0) {
      setGalleryImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    setAdvancedSpecs([...advancedSpecs, { key: "", value: "" }]);
  };

  const handleSpecChange = (
    index: number,
    keyOrValue: "key" | "value",
    text: string,
  ) => {
    setAdvancedSpecs((prevSpecs) =>
      prevSpecs.map((spec, i) =>
        i === index ? { ...spec, [keyOrValue]: text } : spec,
      ),
    );
  };

  const removeSpec = (index: number) => {
    setAdvancedSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    // Reset all states
    setFormData({
      name: "",
      description: "",
      slug: "",
      brand: "",
      costPrice: "",
      regularPrice: "",
      salePrice: "",
      stock: "",
      sku: "",
      lowStockAlert: "5",
      categoryID: "",
      tagsText: "",
      isFeatured: false,
      isNew: true,
      status: "active",
      shippingClass: "normal",
      freeShipping: false,
      shippingCostText: "",
      metaTitle: "",
      metaDescription: "",
    });
    setAdvancedSpecs([]);
    setThumbnail(null);
    setThumbnailPreview(null);
    setGalleryImages([]);
    setGalleryPreviews([]);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !thumbnail ||
      !formData.categoryID ||
      !formData.name ||
      !formData.costPrice ||
      !formData.stock
    ) {
      return toast.error(
        "Please fill required fields (Name, Category, Cost Price, Stock, Thumbnail)",
      );
    }

    setLoading(true);
    const data = new FormData();

    // 1. Append basic string fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "tagsText") {
        // tagsText ke amra alada handle korbo
        const stringValue =
          typeof value === "boolean" ? value.toString() : value;
        data.append(key, stringValue as string);
      }
    });

    // 2. Process Tags (Array ke JSON stringify kore pathate hobe)
    // const tagsArray = formData.tagsText
    //   .split(",")
    //   .map((tag) => tag.trim())
    //   .filter((tag) => tag !== "");
    // data.append("tags", JSON.stringify(tagsArray)); // Send as JSON string
    const tagsArray = tags.map((tag) => tag.value); // {label, value} থেকে শুধু string বের করে আনবে
    data.append("tags", JSON.stringify(tagsArray));

    // 3. Process Advanced Specs (lowdown array format)
    const lowdownArray = advancedSpecs
      .filter((spec) => spec.key && spec.value)
      .map((spec) => `${spec.key}: ${spec.value}`);

    data.append("lowdown", JSON.stringify(lowdownArray)); // Send as JSON string

    // 4. Media Files
    data.append("thumbnail", thumbnail);
    galleryImages.forEach((image) => data.append("images", image));

    try {
      const response = await axios.post(
        `${BASE_URL}/products/create-product`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success("Product published successfully!");
        refreshProducts();
        handleClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // Common styles for labels and inputs
  const labelStyle =
    "block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2";
  const inputStyle =
    "w-full bg-gray-50 border-gray-100 border p-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black/30 placeholder:text-gray-300";
  const sectionTitleStyle =
    "text-xl font-bold text-gray-800 flex items-center gap-2";

  // Toggle switch component (style from image 0, color black/white)
  const ToggleSwitch = ({
    label,
    name,
    checked,
    onChange,
  }: {
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: any) => void;
  }) => (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
      <span className="text-sm text-gray-700">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
      </label>
    </div>
  );

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "#F9FAFB", // bg-gray-50
      borderColor: "#F3F4F6", // border-gray-100
      borderRadius: "0.75rem", // rounded-xl
      padding: "4px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#F3F4F6",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#000000", // Black background for tags
      borderRadius: "6px",
      padding: "2px 4px",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#FFFFFF", // White text
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#FFFFFF",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#FF4444",
        color: "#FFFFFF",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#D1D5DB", // placeholder gray-300
      fontSize: "14px",
    }),
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="relative bg-gray-50 w-full max-w-7xl h-full sm:h-auto max-h-[95vh] shadow-2xl rounded-none sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header - Stays matching image_0.png structure */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all text-gray-600"
            >
              <IoCloseOutline size={20} />
            </button>
            <h2 className={sectionTitleStyle}>Create Product</h2>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-100 bg-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Discard
            </button>
            <button
              form="createProductForm"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2.5 bg-black text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-black/10"
            >
              <IoRocketOutline size={16} />
              {loading ? "Creating..." : "Release Product"}
            </button>
          </div>
        </div>

        <form
          id="createProductForm"
          onSubmit={handleSubmit}
          className="p-8 overflow-y-auto space-y-8 no-scrollbar"
        >
          {/* Main 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10">
            {/* Left Column (Main Data) */}
            <div className="space-y-8">
              {/* 1. Basic Information */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoPricetagOutline className="text-gray-400" /> Basic
                  Information
                </h3>

                <div className="space-y-2">
                  <label className={labelStyle}>Product Title *</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder="Enter product name (e.g. High-end Smartphone)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelStyle}>Product Slug</label>
                    <input
                      name="slug"
                      readOnly
                      value={formData.slug}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      placeholder="slug-will-auto-generate"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelStyle}>Brand Name</label>
                    <input
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="e.g. Nike, Apple"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelStyle}>Product Description *</label>
                  <textarea
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`${inputStyle} resize-none`}
                    placeholder="Write a detailed description..."
                  />
                </div>
              </div>

              {/* 2. Pricing & Inventory */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoCartOutline className="text-gray-400" /> Pricing &
                  Inventory
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={`${labelStyle} text-red-500`}>
                      Cost Price *
                    </label>
                    <input
                      required
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-red-50/50 border-red-100 focus:ring-red-300 font-bold text-red-600`}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelStyle}>Regular Price *</label>
                    <input
                      required
                      type="number"
                      name="regularPrice"
                      value={formData.regularPrice}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelStyle}>Sale Price (Optional)</label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className={labelStyle}>Current Stock *</label>
                    <input
                      required
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={`${inputStyle} focus:ring-black text-black`}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelStyle}>SKU Number</label>
                    <input
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="e.g. PROD-1024"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelStyle}>Low Stock Alert Level</label>
                    <input
                      type="number"
                      name="lowStockAlert"
                      value={formData.lowStockAlert}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Advanced Specifications (Internal Lowdown) */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className={sectionTitleStyle}>
                    <IoSettingsOutline className="text-gray-400" /> Advanced
                    Specifications
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-lg font-bold text-[10px] uppercase tracking-widest text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    <IoAddOutline size={14} /> Add Row
                  </button>
                </div>

                {advancedSpecs.length > 0 ? (
                  <div className="space-y-4">
                    {advancedSpecs.map((spec, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr,1fr,auto] gap-4 items-start bg-gray-50/50 p-4 rounded-xl border border-gray-100"
                      >
                        <input
                          name={`specKey_${index}`}
                          value={spec.key}
                          onChange={(e) =>
                            handleSpecChange(index, "key", e.target.value)
                          }
                          className={`${inputStyle} py-3`}
                          placeholder="Key (e.g. Material)"
                        />
                        <input
                          name={`specValue_${index}`}
                          value={spec.value}
                          onChange={(e) =>
                            handleSpecChange(index, "value", e.target.value)
                          }
                          className={`${inputStyle} py-3`}
                          placeholder="Value (e.g. Cotton)"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpec(index)}
                          className="p-3 bg-red-50 rounded-xl hover:bg-red-100 text-red-500 transition-all"
                        >
                          <IoTrashOutline size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                    <IoSettingsOutline
                      size={40}
                      className="mb-4 text-gray-300"
                    />
                    <p className="text-sm">
                      No specifications. Click &apos;Add Row&apos; to define
                      technical details.
                    </p>
                  </div>
                )}
              </div>

              {/* 4. SEO */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoSearchOutline className="text-gray-400" /> Search Engine
                  Optimization (SEO)
                </h3>

                <div className="space-y-2">
                  <label className={labelStyle}>Meta Title</label>
                  <input
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder="SEO optimized title..."
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelStyle}>Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${inputStyle} resize-none`}
                    placeholder="Detailed SEO description..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column (Side Panels) */}
            <div className="space-y-8 lg:sticky lg:top-[90px] self-start">
              {/* 5. Media Assets - Matching layout from image 0 */}

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoImageOutline className="text-gray-400" /> Media Assets
                </h3>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                  {/* Left Side: Master Thumbnail (Slightly Larger) */}
                  <div className="shrink-0 space-y-3">
                    <label className={labelStyle}>Master Thumbnail *</label>
                    <label className="flex flex-col items-center justify-center w-[240px] h-[240px] border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative group bg-gray-50/50">
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
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Change Image
                      </div>
                    </label>
                  </div>

                  {/* Right Side: Gallery Images (Smaller & More per row) */}
                  <div className="flex-1 space-y-3">
                    <label className={`${labelStyle} flex items-center gap-2`}>
                      <IoImagesOutline /> Gallery Collection (Max 5)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                      {galleryPreviews.map((src, index) => (
                        <div
                          key={index}
                          className="relative w-full aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm bg-white"
                        >
                          <img
                            src={src}
                            className="w-full h-full object-cover"
                            alt="gallery"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <IoTrashOutline size={12} />
                          </button>
                        </div>
                      ))}

                      {/* Compact Gallery Add Button */}
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all bg-gray-50/30 group">
                        <IoAddOutline
                          size={24}
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
                    </div>
                    <p className="text-[10px] text-gray-400 italic mt-2">
                      * You can upload multiple secondary images for the product
                      carousel.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Store Categorization */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoGridOutline className="text-gray-400" /> Store
                  Categorization
                </h3>

                <div className="space-y-2">
                  <label className={labelStyle}>Primary Category *</label>
                  <select
                    required
                    name="categoryID"
                    value={formData.categoryID}
                    onChange={handleInputChange}
                    className={`${inputStyle} cursor-pointer appearance-none`}
                  >
                    <option value="">Select Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div className="space-y-2">
                  <label className={labelStyle}>Search Tags</label>
                  <input
                    name="tagsText"
                    value={formData.tagsText}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder="e.g. fashion, smartphone, summer"
                  />
                </div> */}
                <div className="space-y-2">
                  <label className={labelStyle}>Search Tags</label>
                  <CreatableSelect
                    isMulti
                    placeholder="Type tag and press enter..."
                    value={tags}
                    onChange={handleTagChange}
                    styles={customSelectStyles}
                    components={{
                      DropdownIndicator: null, // সার্চ আইকন হাইড করার জন্য
                    }}
                  />
                  <p className="text-[10px] text-gray-400 italic">
                    * Type and press Enter to create multiple tags.
                  </p>
                </div>
              </div>

              {/* 7. Visibility & Promotion */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoLayersOutline className="text-gray-400" /> Visibility &
                  Promotion
                </h3>

                <div className="space-y-4 pt-2">
                  <ToggleSwitch
                    label="Featured Product"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />

                  {/* On Sale is implicitly dynamic from pricing in Mongoose Schema now, but let's just make it a display field if you want to keep the toggle UI, though it doesn't map 1:1 to your schema anymore. Setting as draft/active seems better */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
                    <span className="text-sm text-gray-700">
                      Display Status
                    </span>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="text-sm bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-black/20 text-gray-700"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <ToggleSwitch
                    label="New Arrival Badge"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* 8. Protection & Logistics */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className={sectionTitleStyle}>
                  <IoGridOutline className="text-gray-400" /> Protection &
                  Logistics
                </h3>

                <div className="space-y-2">
                  <label
                    className={`${inputStyle} py-3 flex items-center gap-3 cursor-pointer select-none`}
                  >
                    <input
                      type="checkbox"
                      name="freeShipping"
                      checked={formData.freeShipping}
                      onChange={handleInputChange}
                      className="accent-black w-5 h-5"
                    />
                    <span className="text-sm">Free Shipping</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className={labelStyle}>Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      className={inputStyle}
                      placeholder="0.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelStyle}>Shipping Class</label>
                    <select
                      name="shippingClass"
                      value={formData.shippingClass}
                      onChange={handleInputChange}
                      className={`${inputStyle} py-3 cursor-pointer appearance-none`}
                    >
                      <option value="normal">Normal</option>
                      <option value="fragile">Fragile</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
