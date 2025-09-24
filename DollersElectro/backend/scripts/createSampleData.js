const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB using the correct URI from .env
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSampleData = async () => {
  try {
    console.log('🔄 Creating sample data for analytics...');

    // Check if sample data already exists
    const existingOrders = await Order.countDocuments();
    if (existingOrders > 0) {
      console.log('✅ Sample data already exists. Skipping creation.');
      return;
    }

    // Create sample customers using the proper User model methods
    const { user: customer1 } = await User.createCustomer({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      phone: '0712345678',
      isActive: true
    });

    const { user: customer2 } = await User.createCustomer({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      username: 'janesmith',
      phone: '0712345679',
      isActive: true
    });

    // Create sample products
    const product1 = await Product.create({
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced features',
      price: 999.99,
      category: 'Smartphones',
      stockQuantity: 50,
      isActive: true,
      sku: 'IPHONE15PRO001'
    });

    const product2 = await Product.create({
      name: 'Samsung Galaxy S24',
      description: 'Premium Android smartphone',
      price: 899.99,
      category: 'Smartphones',
      stockQuantity: 45,
      isActive: true,
      sku: 'SAMSUNG24S001'
    });

    const product3 = await Product.create({
      name: 'MacBook Pro M3',
      description: 'Powerful laptop for professionals',
      price: 1999.99,
      category: 'Laptops',
      stockQuantity: 30,
      isActive: true,
      sku: 'MACBOOKM3001'
    });

    // Create sample orders
    const order1 = await Order.create({
      customer: customer1._id,
      items: [{
        product: product1._id,
        quantity: 1,
        price: 999.99,
        total: 999.99,
        productSnapshot: {
          name: product1.name,
          sku: product1.sku,
          image: product1.image
        }
      }],
      subtotal: 999.99,
      tax: 99.99,
      shipping: 29.99,
      total: 1129.97,
      status: 'completed',
      payment: {
        method: 'credit_card',
        status: 'completed',
        amount: 1129.97
      },
      delivery: {
        method: 'home_delivery',
        status: 'delivered'
      }
    });

    const order2 = await Order.create({
      customer: customer2._id,
      items: [{
        product: product2._id,
        quantity: 1,
        price: 899.99,
        total: 899.99,
        productSnapshot: {
          name: product2.name,
          sku: product2.sku,
          image: product2.image
        }
      }],
      subtotal: 899.99,
      tax: 89.99,
      shipping: 29.99,
      total: 1019.97,
      status: 'completed',
      payment: {
        method: 'paypal',
        status: 'completed',
        amount: 1019.97
      },
      delivery: {
        method: 'home_delivery',
        status: 'delivered'
      }
    });

    const order3 = await Order.create({
      customer: customer1._id,
      items: [{
        product: product3._id,
        quantity: 1,
        price: 1999.99,
        total: 1999.99,
        productSnapshot: {
          name: product3.name,
          sku: product3.sku,
          image: product3.image
        }
      }],
      subtotal: 1999.99,
      tax: 199.99,
      shipping: 49.99,
      total: 2249.97,
      status: 'pending',
      payment: {
        method: 'credit_card',
        status: 'pending',
        amount: 2249.97
      },
      delivery: {
        method: 'home_delivery',
        status: 'pending'
      }
    });

    console.log('✅ Sample data created successfully!');
    console.log(`📊 Created ${await Order.countDocuments()} orders`);
    console.log(`👥 Created ${await User.countDocuments({ role: 'customer' })} customers`);
    console.log(`📦 Created ${await Product.countDocuments()} products`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleData();

