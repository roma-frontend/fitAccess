export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  price: number;
  inStock: number;
  isPopular?: boolean;
  isActive?: boolean;
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