import { Product, Wholesaler } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 201, name: 'Water 500ml', price: 5.00, wholesalePrice: 2.50, stock: 100, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 202, name: 'XL Energy Drink 150ml', price: 20.00, wholesalePrice: 15.00, stock: 50, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 203, name: 'XL Energy Drink 250ml', price: 0.00, wholesalePrice: 0.00, stock: 30, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 204, name: 'Nescafe Original', price: 15.00, wholesalePrice: 10.00, stock: 40, category: 'Drinks', defaultWholesalerId: 1 },
  { id: 205, name: 'Nescafe Mocha', price: 15.00, wholesalePrice: 10.00, stock: 40, category: 'Drinks', defaultWholesalerId: 1 },
  { id: 206, name: 'Speed', price: 15.00, wholesalePrice: 12.00, stock: 25, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 207, name: 'Speed Apple', price: 15.00, wholesalePrice: 12.00, stock: 25, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 208, name: 'Bitter Lemon', price: 10.00, wholesalePrice: 7.00, stock: 15, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 209, name: 'Black Tea (Iced)', price: 15.00, wholesalePrice: 10.00, stock: 20, category: 'Drinks', defaultWholesalerId: 1 },
  { id: 210, name: 'Juice Petee', price: 5.00, wholesalePrice: 3.00, stock: 5, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 211, name: 'Chocolate Wafer', price: 5.00, wholesalePrice: 2.50, stock: 60, category: 'Snacks', defaultWholesalerId: 3 },
  { id: 212, name: 'Murumuru', price: 15.00, wholesalePrice: 10.00, stock: 0, category: 'Snacks', defaultWholesalerId: 3 },
  { id: 213, name: "Haaroon's Badhan", price: 10.00, wholesalePrice: 6.00, stock: 10, category: 'Snacks', defaultWholesalerId: 3 },
];

export const INITIAL_WHOLESALERS: Wholesaler[] = [
  { id: 1, name: 'Global Foods Inc.', contactPerson: 'John Doe', contactNumber: '555-1234', email: 'john.d@globalfoods.com' },
  { id: 2, name: 'Island Beverages Co.', contactPerson: 'Jane Smith', contactNumber: '555-5678', email: 'jane.s@islandbev.com' },
  { id: 3, name: 'Capital City Snacks', contactPerson: 'Mr. Brown', contactNumber: '555-8765', email: 'brown@ccsnacks.com' }
];
