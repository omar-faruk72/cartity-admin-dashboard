/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "./context/authContext";
import { BASE_URL } from "./helper/BASE_URL";

export default function Home() {
  const { loginUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const loadId = toast.loading("Signing in...");

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        const userData = response.data.data.user;

        // context এ save
        loginUser(userData);

        // 🔐 Role based logic
        if (userData.role === "admin") {
          toast.success("👑 Welcome Admin! Redirecting to dashboard...", {
            id: loadId,
          });

          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
        } else {
          toast.success("🎉 Welcome! You are logged in as a user.", {
            id: loadId,
          });
        }
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      const message =
        error.response?.data?.message || "Login failed!";

      toast.error(message, { id: loadId });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9E4CB] flex flex-col items-center justify-center py-12 px-4 font-sans">
      <div className="max-w-[500px] w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-normal text-gray-800 mb-2 italic">
            admin login
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 md:p-10 shadow-sm rounded-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? (
                    <IoEyeOffOutline size={18} />
                  ) : (
                    <IoEyeOutline size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 accent-black"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-[12px] text-gray-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-white py-4 mt-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-gray-900 transition-all"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}