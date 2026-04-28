/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Share2,
  Save,
  Loader2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  DollarSign,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { toast } from "react-hot-toast"; // Optional: Toast notification এর জন্য

type Settings = {
  siteName: string;
  tagline: string;
  siteURL: string;
  logo: string;
  favicon: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  currency: string;
  currencySymbol: string;
  symbolPosition: "before" | "after";
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
  _id: string;
  updatedAt: string;
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // প্রিভিউ স্টেট
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // ১. ডাটা ফেচিং
  const {
    data: settings,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost:5001/api/v1/settings");
      return data.data;
    },
  });

  // ২. ডাটা আপডেট মিউটেশন
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axios.patch(
        "http://localhost:5001/api/v1/settings/update",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      alert("Settings updated successfully!");
      setLogoPreview(null);
      setFaviconPreview(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Update failed!");
    },
  });

  // ৩. ফাইল হ্যান্ডলিং
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        type === "logo"
          ? setLogoPreview(reader.result as string)
          : setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ৪. সেভ হ্যান্ডলার
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    // সোশ্যাল লিঙ্কগুলো অবজেক্ট আকারে পাঠানোর জন্য ম্যানুয়ালি সেট করা (ব্যাকএন্ড রিকোয়ারমেন্ট অনুযায়ী)
    const socialLinks = {
      facebook: (formRef.current.elements as any).facebook.value,
      instagram: (formRef.current.elements as any).instagram.value,
      twitter: (formRef.current.elements as any).twitter.value,
      youtube: (formRef.current.elements as any).youtube.value,
      linkedin: (formRef.current.elements as any).linkedin.value,
    };

    formData.append("socialLinks", JSON.stringify(socialLinks));

    updateMutation.mutate(formData);
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <form
      ref={formRef}
      onSubmit={handleSave}
      className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen pb-20"
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        name="logo"
        ref={logoInputRef}
        onChange={(e) => handleFileChange(e, "logo")}
        className="hidden"
        accept="image/*"
      />
      <input
        type="file"
        name="favicon"
        ref={faviconInputRef}
        onChange={(e) => handleFileChange(e, "favicon")}
        className="hidden"
        accept="image/*"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Site Configuration{" "}
            {isFetching && (
              <RefreshCw size={18} className="animate-spin text-blue-500" />
            )}
          </h1>
          <p className="text-gray-500">
            Update branding and global store settings
          </p>
        </div>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-70"
        >
          {updateMutation.isPending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {updateMutation.isPending ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BRANDING ASSETS */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800 border-b pb-3">
            <ImageIcon className="text-indigo-500" size={20} /> Branding Assets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Logo Section */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-gray-500 mb-4 uppercase">
                Main Logo
              </p>
              <div
                onClick={() => logoInputRef.current?.click()}
                className="relative group w-full max-w-[280px] h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition"
              >
                <img
                  src={logoPreview || settings?.logo}
                  alt="Logo"
                  className="object-contain h-full p-4"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Upload className="text-white" />
                </div>
              </div>
            </div>

            {/* Favicon Section */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-gray-500 mb-4 uppercase">
                Favicon
              </p>
              <div
                onClick={() => faviconInputRef.current?.click()}
                className="relative group w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition"
              >
                <img
                  src={faviconPreview || settings?.favicon}
                  alt="Favicon"
                  className="w-10 h-10 object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Upload className="text-white" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-3">
              <Globe size={20} className="text-blue-500" /> Site Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Site Name
                </label>
                <input
                  name="siteName"
                  type="text"
                  defaultValue={settings?.siteName}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Site URL
                </label>
                <input
                  name="siteURL"
                  type="text"
                  defaultValue={settings?.siteURL}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Tagline
                </label>
                <input
                  name="tagline"
                  type="text"
                  defaultValue={settings?.tagline}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-3">
              <Mail size={20} className="text-orange-500" /> Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={settings?.email}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Phone
                </label>
                <input
                  name="phone"
                  type="text"
                  defaultValue={settings?.phone}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  WhatsApp
                </label>
                <input
                  name="whatsapp"
                  type="text"
                  defaultValue={settings?.whatsapp}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Address
                </label>
                <textarea
                  name="address"
                  defaultValue={settings?.address}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-3">
              <DollarSign size={20} className="text-emerald-500" /> Market
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <span className="text-2xl font-bold text-emerald-600">
                  {settings?.currencySymbol}
                </span>
                <p className="text-xs font-bold text-emerald-800">
                  {settings?.currency}
                </p>
              </div>
              <select
                name="symbolPosition"
                defaultValue={settings?.symbolPosition}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              >
                <option value="before">Before Amount</option>
                <option value="after">After Amount</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-3">
              <Share2 size={20} className="text-purple-500" /> Socials
            </h2>
            <div className="space-y-3">
              {["facebook", "instagram", "twitter", "youtube", "linkedin"].map(
                (platform) => (
                  <div key={platform}>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">
                      {platform}
                    </label>
                    <input
                      name={platform}
                      type="text"
                      defaultValue={(settings?.socialLinks as any)?.[platform]}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
