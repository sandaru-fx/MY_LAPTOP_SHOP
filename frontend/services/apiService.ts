
import { Laptop, User, Order, AnalyticsData, OrderStatus } from '../types';
import { INITIAL_LAPTOPS, INITIAL_USERS, MOCK_REVENUE } from '../constants';

const API_BASE_URL = 'http://localhost:5000/api';

class APIService {
  private isBackendLive = false;

  constructor() {
    this.checkConnection();
  }

  private async checkConnection() {
    try {
      const resp = await fetch(`${API_BASE_URL}/health`);
      this.isBackendLive = resp.ok;
    } catch {
      this.isBackendLive = false;
      console.warn("Backend node offline. Initializing Simulated Neural Storage.");
    }
  }

  // --- HELPER: Simulated Delay & Storage ---
  private async simulateNetwork<T>(data: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), 600));
  }

  // --- AUTHENTICATION ---
  async login(email: string): Promise<User | null> {
    const users: User[] = JSON.parse(localStorage.getItem('luxe_users') || JSON.stringify(INITIAL_USERS));
    const user = users.find(u => u.email === email && u.isActive);
    if (user) {
      localStorage.setItem('luxe_auth', JSON.stringify(user));
      return this.simulateNetwork(user);
    }
    throw new Error("Credentials rejected by authentication node.");
  }

  async register(name: string, email: string): Promise<User> {
    const users: User[] = JSON.parse(localStorage.getItem('luxe_users') || JSON.stringify(INITIAL_USERS));
    if (users.some(u => u.email === email)) throw new Error("Identity already registered in global directory.");

    const newUser: User = {
      id: `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name, email, role: 'USER', isActive: true
    };

    users.push(newUser);
    localStorage.setItem('luxe_users', JSON.stringify(users));
    return this.simulateNetwork(newUser);
  }

  // --- LAPTOP INVENTORY ---
  async getLaptops(): Promise<Laptop[]> {
    const data = localStorage.getItem('luxe_laptops');
    return this.simulateNetwork(data ? JSON.parse(data) : INITIAL_LAPTOPS);
  }

  async saveLaptop(laptop: Omit<Laptop, 'id'> | Laptop): Promise<Laptop> {
    const laptops: Laptop[] = JSON.parse(localStorage.getItem('luxe_laptops') || JSON.stringify(INITIAL_LAPTOPS));

    // Validation
    if (laptop.price <= 0) throw new Error("Price must be a positive asset value.");
    if (laptop.stock < 0) throw new Error("Stock cannot be negative.");

    let finalLaptop: Laptop;
    if ('id' in laptop) {
      const index = laptops.findIndex(l => l.id === laptop.id);
      laptops[index] = laptop as Laptop;
      finalLaptop = laptop as Laptop;
    } else {
      finalLaptop = { ...laptop, id: `LP-${Math.random().toString(36).substr(2, 5).toUpperCase()}` };
      laptops.push(finalLaptop);
    }

    localStorage.setItem('luxe_laptops', JSON.stringify(laptops));
    return this.simulateNetwork(finalLaptop);
  }

  async deleteLaptop(id: string): Promise<void> {
    const laptops: Laptop[] = JSON.parse(localStorage.getItem('luxe_laptops') || '[]');
    const filtered = laptops.filter(l => l.id !== id);
    localStorage.setItem('luxe_laptops', JSON.stringify(filtered));
    return this.simulateNetwork(undefined);
  }

  // --- OPERATIONS / ORDERS ---
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const orders: Order[] = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
    const laptops: Laptop[] = JSON.parse(localStorage.getItem('luxe_laptops') || JSON.stringify(INITIAL_LAPTOPS));

    // Inventory Check & Deduction
    for (const item of orderData.items) {
      const lpIndex = laptops.findIndex(l => l.id === item.id);
      if (laptops[lpIndex].stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.model}. Available: ${laptops[lpIndex].stock}`);
      }
      laptops[lpIndex].stock -= item.quantity;
    }

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    localStorage.setItem('luxe_orders', JSON.stringify(orders));
    localStorage.setItem('luxe_laptops', JSON.stringify(laptops));
    return this.simulateNetwork(newOrder);
  }

  async getOrders(): Promise<Order[]> {
    const orders = localStorage.getItem('luxe_orders');
    return this.simulateNetwork(orders ? JSON.parse(orders) : []);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const orders: Order[] = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem('luxe_orders', JSON.stringify(orders));
    }
    return this.simulateNetwork(undefined);
  }

  // --- USER MGMT ---
  async getUsers(): Promise<User[]> {
    const users = localStorage.getItem('luxe_users');
    return this.simulateNetwork(users ? JSON.parse(users) : INITIAL_USERS);
  }

  async toggleUser(id: string): Promise<void> {
    const users: User[] = JSON.parse(localStorage.getItem('luxe_users') || '[]');
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].isActive = !users[index].isActive;
      localStorage.setItem('luxe_users', JSON.stringify(users));
    }
    return this.simulateNetwork(undefined);
  }

  // --- USER PROFILE ---
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const users: User[] = JSON.parse(localStorage.getItem('luxe_users') || JSON.stringify(INITIAL_USERS));
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) throw new Error("User not found in directory.");

    // Validate email uniqueness if email is being updated
    if (updates.email && updates.email !== users[index].email) {
      if (users.some(u => u.email === updates.email && u.id !== userId)) {
        throw new Error("Email already in use by another identity.");
      }
    }

    users[index] = { ...users[index], ...updates };
    localStorage.setItem('luxe_users', JSON.stringify(users));

    // Update auth if this is the current user
    const currentAuth = localStorage.getItem('luxe_auth');
    if (currentAuth) {
      const authUser = JSON.parse(currentAuth);
      if (authUser.id === userId) {
        localStorage.setItem('luxe_auth', JSON.stringify(users[index]));
      }
    }

    return this.simulateNetwork(users[index]);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const orders: Order[] = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
    const userOrders = orders.filter(o => o.userId === userId);
    return this.simulateNetwork(userOrders);
  }
}

export const api = new APIService();
