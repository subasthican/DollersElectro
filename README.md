# 🔌 DollersElectro - E-commerce Platform

A comprehensive e-commerce platform for electrical products built with React, Node.js, and MongoDB Atlas.

## 👥 Team Members

| Name | Role | GitHub Username | Responsibilities |
|------|------|----------------|------------------|
| **Subasthican** | Team Leader | `@subasthican` | User Management, AI Chat, Quiz, Analytics, Payment, Warranty, Checkout |
| **Gowsika** | Product Manager | `@gowsika` | Product Management, Notifications, Promo Codes, Payment, Returns, Cart |
| **Raja** | Order Specialist | `@raja` | Order Management, Order History, Order Tracking |
| **Sobiyan** | Delivery Specialist | `@sobiyan` | Delivery Management, Shipping, Order Tracking |
| **Biranavi** | Customer Service | `@biranavi` | Contact Management, Messages, Support, Live Chat |

## 🚀 Features

### **Customer Features**
- 🛒 Product browsing and search
- 🛍️ Shopping cart and wishlist
- 💳 Multiple payment methods
- 📦 Order tracking and history
- 🤖 AI-powered product recommendations
- 🎯 Quiz system with gamification
- 📱 Responsive design

### **Admin Features**
- 👥 User management (customers, employees, admins)
- 📦 Product management (CRUD operations)
- 📊 Analytics dashboard
- 🎯 Quiz management system
- 💬 Live chat support
- 📧 Notification system
- 🎫 Promo code management

### **Employee Features**
- 📦 Order processing
- 🚚 Delivery management
- 👥 Customer support
- 📊 Basic analytics

## 🛠️ Tech Stack

### **Frontend**
- React 18 with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### **Backend**
- Node.js with Express.js
- MongoDB Atlas (cloud database)
- JWT for authentication
- Mongoose for ODM
- Bcrypt for password hashing

### **Additional Tools**
- Ollama for AI chat functionality
- Cloudinary for image storage
- Rate limiting for API protection
- CORS for cross-origin requests

## 📁 Project Structure

```
DollersElectro/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── types/           # TypeScript type definitions
├── backend/                  # Node.js backend application
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   └── services/            # Business logic services
└── test-app/                # Testing application
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourUsername/DollersElectro.git
   cd DollersElectro
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB Atlas URI and JWT secret
   
   # Frontend
   cd ../frontend
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start the applications**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm start
   
   # Frontend (Terminal 2)
   cd frontend
   npm start
   ```

## 🔧 Development Workflow

### **Branch Strategy**
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches for each team member

### **Team Member Branches**
- `feature/user-management` - Subasthican
- `feature/product-management` - Gowsika
- `feature/order-management` - Raja
- `feature/delivery-management` - Sobiyan
- `feature/contact-management` - Biranavi

### **Commit Convention**
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### **Orders**
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### **Users**
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/admin/customers` - Get customers (Admin)
- `POST /api/users/admin/customers` - Create customer (Admin)
- `PUT /api/users/admin/customers/:id` - Update customer (Admin)

## 🎯 Viva Presentation

This project demonstrates:
- **Team Collaboration** - Multiple developers working on different features
- **Full-Stack Development** - React frontend with Node.js backend
- **Database Integration** - MongoDB Atlas for data persistence
- **Modern Development Practices** - Git workflow, TypeScript, responsive design
- **Advanced Features** - AI integration, real-time chat, gamification

## 📝 License

This project is created for educational purposes and viva presentation.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

- **Team Leader**: Subasthican
- **Project**: DollersElectro E-commerce Platform
- **Purpose**: Viva Presentation

---

**Built with ❤️ by Team DollersElectro**
