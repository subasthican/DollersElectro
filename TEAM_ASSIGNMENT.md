# 👥 Team Assignment - DollersElectro E-commerce Platform

## 🎯 Project Overview
This document outlines the team structure and individual responsibilities for the DollersElectro e-commerce platform viva presentation.

## 👨‍💼 Team Structure

### **Subasthican (Team Leader) - ~40 files**
**Primary Focus:** User Management + Advanced Features

#### **Backend Responsibilities:**
- `models/User.js` - User schema and validation
- `routes/auth-mongodb-only.js` - Authentication routes
- `routes/users-mongodb-only.js` - User management routes
- `routes/aiChat.js` - AI chat functionality
- `routes/quiz-mongodb-only.js` - Quiz management system
- `services/aiService.js` - AI service logic

#### **Frontend Responsibilities:**
- `src/pages/auth/` - Authentication pages (Login, Register, Profile)
- `src/pages/profile/` - User profile management
- `src/store/slices/authSlice.ts` - Authentication state management
- `src/services/api/authAPI.ts` - Authentication API calls
- `src/services/api/quizAPI.ts` - Quiz API calls
- `src/pages/QuizPage.tsx` - Quiz taking interface
- `src/pages/admin/QuizManagementPage.tsx` - Quiz admin management
- `src/components/chat/AIChatbox.tsx` - AI chat component

#### **Customer Pages:**
- `src/pages/HomePage.tsx` - Home page
- `src/pages/AboutPage.tsx` - About page
- `src/pages/HelpPage.tsx` - Help page
- `src/pages/PrivacyPage.tsx` - Privacy policy
- `src/pages/SettingsPage.tsx` - User settings
- `src/pages/WarrantyPage.tsx` - Warranty information
- `src/pages/checkout/CheckoutPage.tsx` - Checkout process
- `src/pages/DeliveryInfoPage.tsx` - Delivery information

#### **Payment & Warranty:**
- Credit Card payment integration
- Crypto payment integration
- Warranty management system
- Checkout flow implementation

---

### **Gowsika (Product Manager) - ~40 files**
**Primary Focus:** Product Management + Business Features

#### **Backend Responsibilities:**
- `models/Product.js` - Product schema
- `models/Category.js` - Category schema
- `models/PromoCode.js` - Promo code schema
- `models/Notification.js` - Notification schema
- `routes/products-mongodb-only.js` - Product management routes
- `routes/promoCode.js` - Promo code routes
- `routes/analytics.js` - Analytics routes

#### **Frontend Responsibilities:**
- `src/pages/products/` - Product listing and detail pages
- `src/pages/categories/` - Category pages
- `src/pages/admin/AdminProductsPage.tsx` - Product admin management
- `src/pages/admin/PromoCodeManagement.tsx` - Promo code management
- `src/store/slices/productSlice.ts` - Product state management
- `src/services/api/productAPI.ts` - Product API calls
- `src/components/cart/PromoCodeInput.tsx` - Promo code input

#### **Customer Pages:**
- `src/pages/ProductsPage.tsx` - Main products page
- `src/pages/ProductDetailPage.tsx` - Product detail page
- `src/pages/CartPage.tsx` - Shopping cart
- `src/pages/WishlistPage.tsx` - Wishlist page
- `src/pages/ContactPage.tsx` - Contact page
- `src/pages/NotificationsPage.tsx` - Notifications
- `src/pages/ReturnsPage.tsx` - Returns management
- `src/pages/PaymentPage.tsx` - Payment processing
- `src/pages/PaymentSuccessPage.tsx` - Payment success

#### **Business Features:**
- PayPal payment integration
- Bank transfer payment integration
- Returns management system
- Notification system
- Live chat functionality
- Promo code system

---

### **Raja (Order Specialist) - ~10 files**
**Primary Focus:** Order Management

#### **Backend Responsibilities:**
- `models/Order.js` - Order schema
- `routes/orders-mongodb-only.js` - Order management routes

#### **Frontend Responsibilities:**
- `src/pages/orders/` - Order management pages
- `src/pages/OrderTrackingPage.tsx` - Order tracking
- `src/pages/CustomerOrderTracking.tsx` - Customer order tracking
- `src/store/slices/orderSlice.ts` - Order state management
- `src/services/api/orderAPI.ts` - Order API calls

#### **Customer Pages:**
- `src/pages/orders/OrderHistoryPage.tsx` - Order history
- `src/pages/orders/OrderDetailsPage.tsx` - Order details

---

### **Sobiyan (Delivery Specialist) - ~9 files**
**Primary Focus:** Delivery Management

#### **Backend Responsibilities:**
- Delivery tracking in `routes/orders-mongodb-only.js`
- Shipping management logic

#### **Frontend Responsibilities:**
- `src/pages/admin/AdminDeliveryManagement.tsx` - Delivery admin
- `src/pages/ShippingPage.tsx` - Shipping information
- Delivery tracking components

#### **Customer Pages:**
- `src/pages/OrderTrackingPage.tsx` - Order tracking
- `src/pages/ShippingPage.tsx` - Shipping details

---

### **Biranavi (Customer Service) - ~11 files**
**Primary Focus:** Contact Management

#### **Backend Responsibilities:**
- `models/Message.js` - Message schema
- `routes/messages.js` - Message routes
- `routes/chat.js` - Live chat routes

#### **Frontend Responsibilities:**
- `src/pages/ContactPage.tsx` - Contact page
- `src/components/chat/LiveChat.tsx` - Live chat component
- `src/services/api/messagesAPI.ts` - Messages API

#### **Customer Pages:**
- `src/pages/ContactPage.tsx` - Contact form
- `src/pages/HelpPage.tsx` - Help and support
- `src/pages/AboutPage.tsx` - About information

---

## 🔄 Git Workflow

### **Branch Structure**
```
main (production)
├── develop (development)
├── feature/user-management (Subasthican)
├── feature/product-management (Gowsika)
├── feature/order-management (Raja)
├── feature/delivery-management (Sobiyan)
└── feature/contact-management (Biranavi)
```

### **Commit Convention**
Each team member should use their name in commit messages:
```bash
git commit -m "feat: Add user authentication system - Subasthican"
git commit -m "feat: Implement product CRUD operations - Gowsika"
git commit -m "feat: Add order management system - Raja"
git commit -m "feat: Implement delivery tracking - Sobiyan"
git commit -m "feat: Add contact management - Biranavi"
```

## 📊 File Distribution Summary

| Team Member | Backend Files | Frontend Files | Total Files | Focus Area |
|-------------|---------------|----------------|-------------|------------|
| **Subasthican** | 8 | 32 | ~40 | User Management + Advanced Features |
| **Gowsika** | 7 | 33 | ~40 | Product Management + Business Features |
| **Raja** | 2 | 8 | ~10 | Order Management |
| **Sobiyan** | 1 | 8 | ~9 | Delivery Management |
| **Biranavi** | 3 | 8 | ~11 | Contact Management |

## 🎯 Viva Presentation Strategy

### **Individual Demonstrations**
1. **Subasthican**: User authentication, AI chat, quiz system, analytics
2. **Gowsika**: Product management, payment processing, notifications
3. **Raja**: Order processing, order tracking, order history
4. **Sobiyan**: Delivery management, shipping tracking
5. **Biranavi**: Customer support, live chat, contact management

### **Collaboration Evidence**
- GitHub commit history showing individual contributions
- Feature branch merges demonstrating team coordination
- Code reviews and pull requests
- Shared responsibility for customer-facing pages

## 📝 Notes for Viva

- Each team member should be able to explain their specific features
- Show GitHub evidence of collaboration
- Demonstrate the full user journey from registration to purchase
- Highlight the use of modern technologies (React, Node.js, MongoDB)
- Show both frontend and backend integration
- Demonstrate admin, employee, and customer role differences

---

**This assignment ensures balanced workload distribution and clear ownership of features for the viva presentation.**
