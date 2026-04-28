export type ModalType =
  | "createProduct"
  | "editProduct"
  | "deleteProduct"
  | "updateProduct";



 export interface UpdateProductModalProps {
  categories?: { value: string; label: string }[]; // categories 
  refreshProducts: () => void | Promise<void>;   // Promise সাপোর্ট 
}