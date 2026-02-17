const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Wallet = require('../models/Wallet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    // --- 1. Users ---
    // Admin
    const adminEmail = 'admin@example.com';
    const adminPassword = 'adminpassword';
    const adminHashedPassword = await bcrypt.hash(adminPassword, 12);
    let admin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        firstName: 'Admin', lastName: 'User', password: adminHashedPassword, role: 'admin', status: 'Active'
      },
      { upsert: true, new: true }
    );
    console.log(`Admin ready: ${adminEmail}`);

    // User
    const userEmail = 'user@example.com';
    const userPassword = 'userpassword';
    const userHashedPassword = await bcrypt.hash(userPassword, 12);
    let user = await User.findOneAndUpdate(
       { email: userEmail },
       {
         firstName: 'Test', lastName: 'User', password: userHashedPassword, role: 'user', status: 'Active'
       },
       { upsert: true, new: true }
    );
    // User Init
    const userId = user._id;
    await Cart.findOneAndUpdate({ userId }, { $setOnInsert: { items: [] } }, { upsert: true });
    await Wishlist.findOneAndUpdate({ userId }, { $setOnInsert: { products: [] } }, { upsert: true });
    await Wallet.findOneAndUpdate({ userId }, { $setOnInsert: { balance: 0, transactions: [] } }, { upsert: true });
    console.log(`User ready: ${userEmail}`);

    // --- 2. Categories ---
    // Scene 1: Active Root -> Active Sub
    let elec = await Category.findOneAndUpdate({ name: 'Electronics Test' }, { isActive: true, parentCategory: null }, { upsert: true, new: true });
    let laptops = await Category.findOneAndUpdate({ name: 'Laptops Test' }, { isActive: true, parentCategory: elec._id }, { upsert: true, new: true });

    // Scene 2: Active Root -> Inactive Sub
    let tablets = await Category.findOneAndUpdate({ name: 'Tablets Inactive Test' }, { isActive: false, parentCategory: elec._id }, { upsert: true, new: true });

    // Scene 3: Inactive Root -> Active Sub
    let furn = await Category.findOneAndUpdate({ name: 'Furniture Inactive Test' }, { isActive: false, parentCategory: null }, { upsert: true, new: true });
    let chairs = await Category.findOneAndUpdate({ name: 'Chairs Test' }, { isActive: true, parentCategory: furn._id }, { upsert: true, new: true });

    console.log('Categories seeded');

    // --- 3. Products ---
    // Helper to create product
    const createProduct = async (name, parent, sub, active = true, price = 1000) => {
        await Product.deleteOne({ name }); 
        const p = new Product({
            name,
            brand: 'TestBrand',
            description: 'Test Description',
            parentCategory: parent._id,
            subCategory: sub._id,
            price,
            variants: [{ color: 'Black', sizes: [{ size: 'M', stock: 10 }], images: [], isActive: true }],
            isActive: active
        });
        await p.save();
        console.log(`Product created: ${name} (Active: ${active})`);
    };

    // 1. Visible Product (Active Root, Active Sub, Active Product)
    await createProduct('Visible MacBook', elec, laptops, true);

    // 2. Hidden by Product Status (Active Root, Active Sub, Inactive Product)
    await createProduct('Hidden Inactive MacBook', elec, laptops, false);

    // 3. Hidden by Subcategory (Active Root, Inactive Sub, Active Product)
    await createProduct('Hidden iPad (Sub Inactive)', elec, tablets, true);

    // 4. Hidden by Parent Category (Inactive Root, Active Sub, Active Product)
    await createProduct('Hidden Chair (Root Inactive)', furn, chairs, true);

    console.log('--- SEEDING COMPLETE ---');
    console.log('Please verify only "Visible MacBook" is visible in the shop.');
    
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
