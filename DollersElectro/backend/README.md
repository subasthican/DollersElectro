# DollersElectro Backend

Express + Node.js API for the DollersElectro e-commerce platform.

## Features

- 🔐 Authentication (JWT, Refresh Tokens, BCRYPT)
- 🛒 E-commerce API (Inventory, Orders, Products)
- 👤 Role-based Authorization
- 🤖 AI Integration (Ollama)
- 📧 Email Services (Nodemailer, OTP)
- 🖼️ Cloudinary Image Uploads
- 📊 Admin Analytics
- 💬 Real-time Chat (Socket.io)

## Tech Stack

- **Server**: Express.js
- **Runtime**: Node.js
- **Database**: MongoDB (Mongoose)
- **Logging**: Winston, Morgan
- **Security**: Rate Limiting, Helmet, Sanitization
- **AI**: Ollama

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- MongoDB installed and running locally
- Ollama (optional, for AI features)

### Installation

1. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (development):
   ```bash
   npm run dev
   ```
4. Start the server (production):
   ```bash
   npm start
   ```

## API Routes

- `/api/auth` - Authentication & User Registration
- `/api/products` - Product management
- `/api/orders` - Order processing & tracking
- `/api/admin` - Administrative management
- `/api/ai-chat` - AI chatbot integration
- `/api/analytics` - System statistics

## Project Structure

```
backend/
├── middleware/     # Auth, validation, error handling
├── models/         # Mongoose schemas
├── routes/         # API endpoints
├── services/       # Core business logic (Email, AI)
├── utils/          # Helper functions
├── uploads/        # Local file storage
├── logs/           # Application logs
└── server.js      # Entry point
```

## License

Proprietary - All rights reserved
