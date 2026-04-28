/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';


export type ModalType = 
  | "addCategory" 
  | "editCategory" 
  | "addProduct" 
  | "editProduct" 
  | "deleteConfirm" 
  | "updateOrderStatus" 
  | null;


interface ModalData {
  category?: any;
  product?: any;
  order?: any;
  apiUrl?: string; 
}

interface ModalStore {
  type: ModalType;
  data: ModalData; 
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ 
    isOpen: true, 
    type, 
    data 
  }),
  onClose: () => set({ 
    type: null, 
    isOpen: false, 
    data: {} 
  }),
}));