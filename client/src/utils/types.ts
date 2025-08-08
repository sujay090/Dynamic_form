// types.ts
export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface Category {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Course {
  _id: string;
  name: string;
  image: string;
  description: string;
  category: Category;
  price: number;
  branchprice: number;
  duration: number;
  isActive: boolean;
}
