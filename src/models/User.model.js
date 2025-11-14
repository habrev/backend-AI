import crypto from 'crypto';

class UserStore {
  constructor() {
    this.users = new Map();
    this.emailIndex = new Map(); 
    this.initializeTestUsers(); 
  }

  initializeTestUsers() {
    const testUsers = [
      {
        id: 'admin-user-id-123',
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin123', // In real app, this should be hashed
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'regular-user-id-456', 
        email: 'user@example.com',
        name: 'Regular User',
        password: 'user123',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    console.log('🔄 Initializing test users...');
    
    // Add test users to the store
    testUsers.forEach(user => {
      this.users.set(user.id, user);
      this.emailIndex.set(user.email, user.id);
      console.log(`✅ Added user: ${user.email} (${user.role})`);
    });

    console.log(`📊 Total users initialized: ${this.users.size}`);
  }

  async create(data) {
    // Check if email already exists
    if (this.emailIndex.has(data.email)) {
      return null;
    }

    const user = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      password: data.password, // Make sure to include password
      role: data.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);
    return user;
  }

  async findById(id) {
    return this.users.get(id) || null;
  }

  async findByEmail(email) {
    const id = this.emailIndex.get(email);
    return id ? this.users.get(id) || null : null;
  }

  async update(id, data) {
    const user = this.users.get(id);
    if (!user) return null;

    // Update email index if email changed
    if (data.email && data.email !== user.email) {
      if (this.emailIndex.has(data.email)) {
        return null; // Email already exists
      }
      this.emailIndex.delete(user.email);
      this.emailIndex.set(data.email, id);
    }

    const updated = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id) {
    const user = this.users.get(id);
    if (user) {
      this.emailIndex.delete(user.email);
      return this.users.delete(id);
    }
    return false;
  }

  async findAll() {
    return Array.from(this.users.values());
  }
}

export const userStore = new UserStore();
