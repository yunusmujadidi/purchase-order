import { create } from "zustand";

type Order = {
  id: string;
  clientName: string;
  clientProject?: string | null;
  productName: string;
  quantity: number;
  size?: string | null;
  description?: string | null;
  materials?: string[];
  deliveryDate?: Date | null;
  deliveryAddress?: string | null;
  notes?: string | null;
};

type OrderModalStore = {
  isOpen: boolean;
  isEdit: boolean;
  order: Order | null;
  onOpen: () => void;
  onEdit: (order: Order) => void;
  onClose: () => void;
};

export const useOrderModal = create<OrderModalStore>((set) => ({
  isOpen: false,
  isEdit: false,
  order: null,
  onOpen: () => set({ isOpen: true, isEdit: false, order: null }),
  onEdit: (order) => set({ isOpen: true, isEdit: true, order }),
  onClose: () => set({ isOpen: false, isEdit: false, order: null }),
}));
