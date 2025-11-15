import { Product, Wholesaler, Customer } from './types';

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
  { id: 214, name: 'Coca-Cola 300ml', price: 10.00, wholesalePrice: 6.00, stock: 80, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 215, name: 'Sprite 300ml', price: 10.00, wholesalePrice: 6.00, stock: 75, category: 'Drinks', defaultWholesalerId: 2 },
  { id: 216, name: 'Lays Chips (Classic)', price: 15.00, wholesalePrice: 10.00, stock: 40, category: 'Snacks', defaultWholesalerId: 3 },
  { id: 217, name: 'Pringles (Original)', price: 45.00, wholesalePrice: 35.00, stock: 20, category: 'Snacks', defaultWholesalerId: 3 },
  { id: 218, name: 'Cup Noodles', price: 25.00, wholesalePrice: 18.00, stock: 30, category: 'Misc', defaultWholesalerId: 1 },
  { id: 219, name: 'AA Battery (2-pack)', price: 20.00, wholesalePrice: 12.00, stock: 15, category: 'Misc', defaultWholesalerId: 1 },
  { id: 220, name: 'Milo Packet', price: 5.00, wholesalePrice: 3.00, stock: 100, category: 'Drinks', defaultWholesalerId: 1 },
];

export const INITIAL_WHOLESALERS: Wholesaler[] = [
  { id: 1, name: 'Global Foods Inc.', contactPerson: 'John Doe', contactNumber: '555-1234', email: 'john.d@globalfoods.com' },
  { id: 2, name: 'Island Beverages Co.', contactPerson: 'Jane Smith', contactNumber: '555-5678', email: 'jane.s@islandbev.com' },
  { id: 3, name: 'Capital City Snacks', contactPerson: 'Mr. Brown', contactNumber: '555-8765', email: 'brown@ccsnacks.com' }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Aminath Shifa', email: 'ashifa@example.com', phone: '7771111', telegramId: '@ashifa', redboxId: 1001, address: 'H. Green, Male', loyaltyPoints: 120, maximumCreditLimit: 1000, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 2, name: 'Ahmed Rilwan', email: 'arilwan@example.com', phone: '7772222', telegramId: '@arilwan', redboxId: 1002, address: 'M. Blue, Male', loyaltyPoints: 450, maximumCreditLimit: 1500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 3, name: 'Fathimath Ziyana', email: 'fziyana@example.com', phone: '7773333', telegramId: '@fziyana', redboxId: 1003, address: 'G. Yellow, Male', loyaltyPoints: 800, maximumCreditLimit: 2000, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 4, name: 'Ibrahim Rameez', email: 'irameez@example.com', phone: '7774444', telegramId: '@irameez', redboxId: 1004, address: 'H. Red, Male', loyaltyPoints: 50, maximumCreditLimit: 500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 5, name: 'Mariyam Liyana', email: 'mliyana@example.com', phone: '7775555', telegramId: '@mliyana', redboxId: 1005, address: 'M. Orange, Male', loyaltyPoints: 2100, maximumCreditLimit: 5000, creditBlocked: true, createdAt: new Date().toISOString() },
  { id: 6, name: 'Mohamed Shiyam', email: 'mshiyam@example.com', phone: '7776666', telegramId: '@mshiyam', redboxId: 1006, address: 'G. Purple, Male', loyaltyPoints: 300, maximumCreditLimit: 1000, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 7, name: 'Aishath Rishfa', email: 'arishfa@example.com', phone: '7777777', telegramId: '@arishfa', redboxId: 1007, address: 'H. Pink, Male', loyaltyPoints: 1500, maximumCreditLimit: 2500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 8, name: 'Hassan Zareer', email: 'hzareer@example.com', phone: '7778888', telegramId: '@hzareer', redboxId: 1008, address: 'M. White, Male', loyaltyPoints: 0, maximumCreditLimit: 500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 9, name: 'Hawwa Inaya', email: 'hinaya@example.com', phone: '7779999', telegramId: '@hinaya', redboxId: 1009, address: 'G. Black, Male', loyaltyPoints: 75, maximumCreditLimit: 750, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 10, name: 'Ali Naushad', email: 'anaushad@example.com', phone: '7781111', telegramId: '@anaushad', redboxId: 1010, address: 'H. Silver, Male', loyaltyPoints: 950, maximumCreditLimit: 2000, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 11, name: 'Zainab Nihad', email: 'znihad@example.com', phone: '7782222', telegramId: '@znihad', redboxId: 1011, address: 'M. Gold, Male', loyaltyPoints: 1250, maximumCreditLimit: 2500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 12, name: 'Yusuf Sameer', email: 'ysameer@example.com', phone: '7783333', telegramId: '@ysameer', redboxId: 1012, address: 'G. Bronze, Male', loyaltyPoints: 250, maximumCreditLimit: 1000, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 13, name: 'Rizna Ahmed', email: 'rahmed@example.com', phone: '7784444', telegramId: '@rahmed', redboxId: 1013, address: 'H. Cyan, Male', loyaltyPoints: 550, maximumCreditLimit: 1500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 14, name: 'Ismail Shimhaz', email: 'ishimhaz@example.com', phone: '7785555', telegramId: '@ishimhaz', redboxId: 1014, address: 'M. Magenta, Male', loyaltyPoints: 1800, maximumCreditLimit: 3000, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 15, name: 'Shamla Ibrahim', email: 'sibrahim@example.com', phone: '7786666', telegramId: '@sibrahim', redboxId: 1015, address: 'G. Lime, Male', loyaltyPoints: 400, maximumCreditLimit: 1000, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 16, name: 'Abdulla Shujau', email: 'ashujau@example.com', phone: '7787777', telegramId: '@ashujau', redboxId: 1016, address: 'H. Teal, Male', loyaltyPoints: 600, maximumCreditLimit: 1500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 17, name: 'Moomina Adam', email: 'madam@example.com', phone: '7788888', telegramId: '@madam', redboxId: 1017, address: 'M. Aqua, Male', loyaltyPoints: 1100, maximumCreditLimit: 2000, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 18, name: 'Nasih Jaleel', email: 'njaleel@example.com', phone: '7789999', telegramId: '@njaleel', redboxId: 1018, address: 'G. Olive, Male', loyaltyPoints: 30, maximumCreditLimit: 500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 19, name: 'Azlifa Ali', email: 'aali@example.com', phone: '7791111', telegramId: '@aali', redboxId: 1019, address: 'H. Maroon, Male', loyaltyPoints: 700, maximumCreditLimit: 1500, creditBlocked: false, createdAt: new Date().toISOString() },
  { id: 20, name: 'Shahudhaan Ahmed', email: 'sahmed@example.com', phone: '7792222', telegramId: '@sahmed', redboxId: 1020, address: 'M. Navy, Male', loyaltyPoints: 900, maximumCreditLimit: 2000, creditBlocked: false, createdAt: new Date().toISOString() },
];
