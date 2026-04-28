/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  IoCloseOutline, 
  IoChevronDownOutline,
  IoPrintOutline,
} from "react-icons/io5";
import { useModalStore } from "../store/useModalStore";
import { BASE_URL } from "../helper/BASE_URL";

const OrderStatusModal = ({ fetchOrders }: { fetchOrders: () => void }) => {
  const { isOpen, type, data, onClose } = useModalStore();
  const [loading, setLoading] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const isModalOpen = isOpen && type === "updateOrderStatus";
  if (!isModalOpen || !data) return null;

  const order = data as any;
  const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    setShowStatusDropdown(false);
    const toastId = toast.loading(`Updating...`);
    
    try {
      const response = await axios.patch(
        `${BASE_URL}/order/${order._id}/status`, 
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Status updated to ${newStatus}`, { id: toastId });
        fetchOrders(); 
        onClose();     
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop - lighter blur as per your dashboard */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose}></div>

      {/* Main Modal - Adjusted with smaller radius (rounded-xl) */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in duration-200 border border-gray-100">
        
        {/* Header - Simple & Clean */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
          <div className="flex items-center gap-4">
            {/* Status Dropdown - Matching your Select components */}
            <div className="relative">
              <button 
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="bg-white border border-gray-200 px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:border-gray-400 transition-all shadow-sm"
              >
                Status: <span className="font-bold">{order.status}</span>
                <IoChevronDownOutline />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20">
                  {statusOptions.map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => handleStatusUpdate(opt)}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
              <IoCloseOutline size={24} />
            </button>
          </div>
        </div>

        {/* Content Body - Clean Two Column */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Side: Order & Customer Info */}
          <div className="md:col-span-1 space-y-6">
            <div>
              <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Customer Info</h4>
              <div className="text-sm border border-gray-100 p-4 rounded-lg bg-gray-50/30">
                <p className="font-bold text-gray-800">{order.firstName} {order.lastName}</p>
                <p className="text-gray-500">{order.email}</p>
                <p className="text-gray-500 mt-1">{order.phone}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Shipping Address</h4>
              <div className="text-sm border border-gray-100 p-4 rounded-lg bg-gray-50/30 text-gray-600 leading-relaxed">
                {order.shippingAddress?.address}, <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} <br />
                {order.shippingAddress?.country} - {order.shippingAddress?.postalCode}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-black text-white">
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Amount</p>
              <h3 className="text-xl font-bold">${order.totalAmount}</h3>
              <p className="text-[10px] opacity-60 mt-1">Status: {order.paymentStatus}</p>
            </div>
          </div>

          {/* Right Side: Product List */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3">Ordered Products</h4>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.cartItems?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={item.thumbnail} className="w-10 h-10 rounded object-cover border border-gray-100" />
                        <span className="font-medium text-gray-700">{item.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 text-xs font-bold uppercase text-gray-500 hover:text-black">Close</button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-gray-50"
            >
              <IoPrintOutline /> Print Invoice
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusModal;