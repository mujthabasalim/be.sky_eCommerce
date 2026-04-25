# be.sky - Modern E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![EJS](https://img.shields.io/badge/EJS-A91E50?style=for-the-badge&logo=ejs&logoColor=white)](https://ejs.co/)

**be.sky** is a full-featured, responsive E-commerce platform built with the Node.js ecosystem. It provides a seamless shopping experience for users and a robust management system for administrators.

---

## 🚀 Key Features

### 👤 User Side
- **Authentication**: Secure Login/Signup with Password hashing (Bcrypt) and Google OAuth integration.
- **Product Discovery**: Search, filter by category, and sort functionality.
- **Shopping Cart**: Add/Remove items, update quantities, and real-time price calculation.
- **Wishlist**: Save favorite items for later.
- **Secure Checkout**: Integrated with **Razorpay** for smooth payments.
- **Order Management**: Track order status, view history, and download invoices (PDF).
- **Wallet System**: In-app wallet for refunds and quick payments.
- **Coupons & Offers**: Apply discount codes and view active product/category offers.
- **Profile Management**: Manage addresses and personal details.

### 🛡️ Admin Side
- **Advanced Dashboard**: Visual statistics for sales, orders, and users.
- **Product Management**: CRUD operations for products and categories.
- **Order Tracking**: Manage order statuses and cancellations.
- **User Management**: Block/Unblock users and view activity.
- **Coupon System**: Create and manage promotional codes.
- **Offer Management**: Set category-wise and product-wise discounts.
- **Sales Reports**: Generate detailed sales reports in **PDF** and **Excel** formats.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **View Engine**: EJS (Embedded JavaScript)
- **Authentication**: Passport.js (Local & Google Strategy)
- **Payments**: Razorpay
- **Styling**: CSS3, Vanilla JS
- **File Uploads**: Multer
- **Emails**: Nodemailer
- **Utilities**: Winston (Logging), Moment.js, PDFKit, ExcelJS

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- A Razorpay Account (for testing payments)
- A Google Cloud Console project (for Google Auth)

---

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd be.sky
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   SESSION_SECRET_KEY=your_secret_key
   JWT_SECRET_KEY=your_jwt_secret
   
   # Email Configuration
   EMAIL_SMTP_HOST=smtp.gmail.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USERNAME=your_email
   EMAIL_SMTP_PASSWORD=your_app_password
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   
   # Razorpay
   RAZORPAY_ID_KEY=your_key_id
   RAZORPAY_SECRET_KEY=your_key_secret
   ```

4. **Seed the database (Optional)**
   To populate the database with test data (admin and user accounts, categories, and products):
   ```bash
   node scripts/seed.js
   ```
   *Default Admin: `admin@example.com` / `adminpassword`*
   *Default User: `user@example.com` / `userpassword`*

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

---

## 📁 Project Structure

```text
be.sky/
├── config/         # Database and Passport configurations
├── controllers/    # Request handlers
├── middleware/     # Custom auth and error middlewares
├── models/         # Mongoose schemas
├── public/         # Static files (CSS, JS, Images)
├── routes/         # Route definitions (User, Admin, Auth)
├── views/          # EJS templates
├── utils/          # Helper functions
└── app.js          # Application entry point
```

---

## 📜 License

This project is licensed under the ISC License.

---

*Developed with ❤️ by [Mujthaba Salim](https://github.com/mujthabasalim)*
