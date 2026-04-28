"use client";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Type definition (agera code theke nite paren)
export type Settings = {
  siteName: string;
  tagline: string;
  address: string;
  email: string;
  logo: string;
  favicon: string;
  phone: string;
  currency: string;
  currencySymbol: string;
  socialLinks: { [platform: string]: string };
  _id: string;
  updatedAt: string;
};

const fetchSettings = async (): Promise<Settings> => {
  const { data } = await axios.get('http://localhost:5001/api/v1/settings');
  return data.data;
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 10, // ১০ মিনিট পর্যন্ত ডাটা ক্যাশ থাকবে
    refetchOnWindowFocus: false, // বারবার ফেচ হওয়া বন্ধ করবে
  });
};