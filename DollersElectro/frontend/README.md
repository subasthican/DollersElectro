# DollersElectro Frontend

Modern React + TypeScript e-commerce frontend for electrical products.

## Features

- 🛒 Complete e-commerce functionality
- 👤 User authentication with OTP
- 📦 Order management and tracking
- 💳 Multiple payment methods
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Fully responsive design
- 🔐 Role-based access (Admin, Employee, Customer)
- 🤖 AI chatbot integration
- 🎮 Quiz and game features
- ⚡ Fast performance with code splitting

## Tech Stack

- React 18.2
- TypeScript 4.9
- Redux Toolkit
- React Router DOM 6
- Tailwind CSS 3
- Axios
- React Hot Toast
- Framer Motion
- GSAP for animations

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Available Scripts

- `npm start` - Runs the app in development mode on http://localhost:3000
- `npm run build` - Builds the app for production to the `build` folder
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── store/         # Redux store
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   └── types/         # TypeScript types
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Features by Role

### Customer Features
- Browse products and categories
- Search and filter
- Shopping cart
- Wishlist
- Checkout and payment
- Order tracking
- Profile management
- Quiz participation
- AI chatbot assistance

### Admin Features
- Dashboard with analytics
- Product management
- Order management
- Customer management
- Employee management
- Message management
- Quiz management
- Promo code management
- Low stock alerts
- Pickup verification

### Employee Features
- Order management
- Pickup verification
- Limited product access
- Message handling

## Environment Variables

The frontend automatically proxies API requests to `http://localhost:5001` (configured in package.json).

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a private project for DollersElectro.

## License

Proprietary - All rights reserved


