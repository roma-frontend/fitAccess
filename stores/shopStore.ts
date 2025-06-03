import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type OrderStep = 'shop' | 'payment' | 'confirm';

interface ShopStore {
  // Шаги заказа
  orderStep: OrderStep;
  setOrderStep: (step: OrderStep) => void;
  
  // Данные заказа
  pickupType: string;
  setPickupType: (type: string) => void;
  
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  
  // Чек
  receipt: any;
  setReceipt: (receipt: any) => void;
  
  // Сброс состояния
  resetOrder: () => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      // Шаги заказа
      orderStep: 'shop',
      setOrderStep: (step) => set({ orderStep: step }),
      
      // Данные заказа
      pickupType: 'pickup',
      setPickupType: (type) => set({ pickupType: type }),
      
      orderNotes: '',
      setOrderNotes: (notes) => set({ orderNotes: notes }),
      
      // Чек
      receipt: null,
      setReceipt: (receipt) => set({ receipt }),
      
      // Сброс состояния
      resetOrder: () => set({
        orderStep: 'shop',
        pickupType: 'pickup',
        orderNotes: '',
        receipt: null,
      }),
    }),
    {
      name: 'shop-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Не сохраняем чувствительные данные
      partialize: (state) => ({
        orderStep: state.orderStep,
        pickupType: state.pickupType,
        orderNotes: state.orderNotes,
        // receipt не сохраняем в localStorage
      }),
    }
  )
);
