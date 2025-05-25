// components/admin/products/types.ts
export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  price: number;
  inStock: number;
  isPopular?: boolean;
  image?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: Product['category'];
  price: number;
  inStock: number;
  isPopular: boolean;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
  };
}
