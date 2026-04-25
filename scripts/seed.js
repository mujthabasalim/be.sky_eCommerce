const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Wallet = require('../models/Wallet');
const Coupon = require('../models/Coupon');
const Offer = require('../models/Offer');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    // --- 0. Clear Existing Data ---
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Wallet.deleteMany({});
    await Coupon.deleteMany({});
    await Offer.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});

    // --- 1. Users ---
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Admin
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      status: 'Active'
    });
    console.log('Admin created: admin@example.com');

    // Test User
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'user',
      status: 'Active'
    });
    console.log('User created: user@example.com');

    // Initialize User Data
    await Cart.create({ userId: user._id, items: [] });
    await Wishlist.create({ userId: user._id, products: [] });
    await Wallet.create({ userId: user._id, balance: 1000, transactions: [{ amount: 1000, type: 'credit', description: 'Welcome Bonus', date: new Date() }] });

    // --- 2. Categories ---
    const categories = [
      { name: 'Gents', sub: ['T-Shirts', 'Formal Shirts', 'Jeans'] },
      { name: 'Women', sub: ['Dresses', 'Tops', 'Skirts'] },
      { name: 'Kids', sub: ['Onesies', 'T-Shirts', 'Shorts'] }
    ];

    const categoryDocs = {};

    for (const cat of categories) {
      const parent = await Category.create({ name: cat.name, isActive: true, parentCategory: null });
      categoryDocs[cat.name] = { parent, sub: {} };
      
      for (const subName of cat.sub) {
        const sub = await Category.create({ name: subName, isActive: true, parentCategory: parent._id });
        categoryDocs[cat.name].sub[subName] = sub;
      }
    }
    console.log('Categories seeded');

    // --- 3. Products ---
    const products = [
      // Gents
      {
        name: 'Classic White T-Shirt',
        brand: 'UrbanStyle',
        parent: 'Gents',
        sub: 'T-Shirts',
        price: 799,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
        colors: ['White', 'Grey'],
        desc: 'A premium cotton white t-shirt for daily wear.'
      },
      {
        name: 'Slim Fit Blue Jeans',
        brand: 'DenimCo',
        parent: 'Gents',
        sub: 'Jeans',
        price: 1999,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
        colors: ['Dark Blue', 'Light Blue'],
        desc: 'Comfortable stretchable denim for a perfect fit.'
      },
      {
        name: 'Formal White Shirt',
        brand: 'Executive',
        parent: 'Gents',
        sub: 'Formal Shirts',
        price: 1499,
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&w=800&q=80',
        colors: ['White'],
        desc: 'Sharp formal shirt for business meetings.'
      },
      // Women
      {
        name: 'Floral Summer Dress',
        brand: 'Bloom',
        parent: 'Women',
        sub: 'Dresses',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        colors: ['Yellow', 'Pink'],
        desc: 'Lightweight floral dress perfect for summer outings.'
      },
      {
        name: 'Silk Party Top',
        brand: 'Elegance',
        parent: 'Women',
        sub: 'Tops',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80',
        colors: ['Black', 'Maroon'],
        desc: 'Elegant silk top for evening parties.'
      },
      {
        name: 'Denim Mini Skirt',
        brand: 'Vibe',
        parent: 'Women',
        sub: 'Skirts',
        price: 999,
        image: 'https://images.unsplash.com/photo-1583496661160-fb4c88ce351c?auto=format&fit=crop&w=800&q=80',
        colors: ['Blue'],
        desc: 'Trendy denim skirt for a casual look.'
      },
      // Kids
      {
        name: 'Cotton Baby Onesie',
        brand: 'TinyTots',
        parent: 'Kids',
        sub: 'Onesies',
        price: 499,
        image: 'https://images.unsplash.com/photo-1522771935876-2497116a7a9e?auto=format&fit=crop&w=800&q=80',
        colors: ['Sky Blue', 'Soft Pink'],
        desc: 'Super soft 100% cotton onesie for babies.'
      },
      {
        name: 'Cartoon Print T-Shirt',
        brand: 'Kiddo',
        parent: 'Kids',
        sub: 'T-Shirts',
        price: 399,
        image: 'https://images.unsplash.com/photo-1519235108751-14e20f2cd2dd?auto=format&fit=crop&w=800&q=80',
        colors: ['Red', 'Yellow'],
        desc: 'Fun cartoon prints that kids will love.'
      }
    ];

    for (const p of products) {
      await Product.create({
        name: p.name,
        brand: p.brand,
        description: p.desc,
        parentCategory: categoryDocs[p.parent].parent._id,
        subCategory: categoryDocs[p.parent].sub[p.sub]._id,
        price: p.price,
        isActive: true,
        variants: p.colors.map(color => ({
          color,
          sizes: [{ size: 'M', stock: 50 }, { size: 'L', stock: 50 }],
          images: [p.image],
          isActive: true
        }))
      });
    }
    console.log('Products seeded');

    console.log('--- SEEDING COMPLETE ---');
    console.log('New categories: Gents, Women, Kids');
    console.log('Default credentials: user@example.com / password123');
    
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
