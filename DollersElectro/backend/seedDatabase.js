const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

// Sample products data
const sampleProducts = [
  {
    name: 'Smart LED Light Bulb Pro',
    description: 'WiFi-enabled smart LED bulb with 16 million colors, voice control, and energy efficiency. Perfect for smart home automation.',
    sku: 'LED-SMART-001',
    price: 29.99,
    originalPrice: 39.99,
    costPrice: 18.00,
    stock: 150,
    lowStockThreshold: 20,
    category: 'Lighting',
    subcategory: 'Smart Bulbs',
    tags: ['smart', 'wifi', 'voice-control', 'energy-efficient'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=400&fit=crop',
        alt: 'Smart LED Bulb',
        isPrimary: true
      }
    ],
    features: [
      '16 million colors',
      'WiFi connectivity',
      'Voice control (Alexa, Google)',
      'Energy efficient',
      'Dimmable',
      'Scheduling capabilities'
    ],
    specifications: {
      'Wattage': '9W',
      'Lumens': '800lm',
      'Color Temperature': '2700K-6500K',
      'Lifespan': '25,000 hours',
      'Voltage': '120V',
      'Base Type': 'E26'
    },
    weight: 0.3,
    dimensions: {
      length: 4.5,
      width: 4.5,
      height: 4.5
    },
    shippingClass: 'light',
    metaTitle: 'Smart LED Light Bulb Pro - WiFi Enabled Smart Home Lighting',
    metaDescription: 'Transform your home with our Smart LED Light Bulb Pro. Features WiFi connectivity, voice control, and 16 million colors.',
    supplier: {
      name: 'ElectroTech Solutions',
      contact: '+1-555-0123',
      email: 'supplier@electrotech.com'
    },
    warranty: '2 Year Limited',
    isActive: true,
    isFeatured: true,
    isOnSale: true,
    isInStock: true
  },
  {
    name: 'Professional Wire Stripper Set',
    description: 'Complete wire stripping kit with 8 different gauge sizes, ergonomic handles, and precision cutting blades for professional electricians.',
    sku: 'TOOL-WIRE-001',
    price: 45.99,
    originalPrice: 59.99,
    costPrice: 28.00,
    stock: 75,
    lowStockThreshold: 15,
    category: 'Tools',
    subcategory: 'Wire Tools',
    tags: ['professional', 'wire-stripping', 'ergonomic', 'precision'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
        alt: 'Wire Stripper Set',
        isPrimary: true
      }
    ],
    features: [
      '8 gauge sizes (10-24 AWG)',
      'Ergonomic handles',
      'Precision blades',
      'Durable construction',
      'Lifetime warranty',
      'Professional grade'
    ],
    specifications: {
      'Gauge Range': '10-24 AWG',
      'Handle Material': 'Rubberized grip',
      'Blade Material': 'High-carbon steel',
      'Weight': '0.8 lbs',
      'Length': '8.5 inches',
      'Warranty': 'Lifetime'
    },
    weight: 0.8,
    dimensions: {
      length: 8.5,
      width: 2.0,
      height: 1.0
    },
    shippingClass: 'standard',
    metaTitle: 'Professional Wire Stripper Set - 8 Gauge Sizes',
    metaDescription: 'Professional wire stripper set with 8 gauge sizes, ergonomic handles, and lifetime warranty.',
    supplier: {
      name: 'ToolMaster Pro',
      contact: '+1-555-0456',
      email: 'supplier@toolmaster.com'
    },
    warranty: 'Lifetime',
    isActive: true,
    isFeatured: true,
    isOnSale: true,
    isInStock: true
  },
  {
    name: 'Industrial Circuit Breaker Panel',
    description: 'Heavy-duty 200-amp circuit breaker panel with 40 spaces, main breaker, and ground fault protection for commercial installations.',
    sku: 'PANEL-CB-001',
    price: 299.99,
    originalPrice: 399.99,
    costPrice: 180.00,
    stock: 25,
    lowStockThreshold: 5,
    category: 'Electrical Panels',
    subcategory: 'Circuit Breakers',
    tags: ['industrial', '200-amp', 'ground-fault', 'commercial'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
        alt: 'Circuit Breaker Panel',
        isPrimary: true
      }
    ],
    features: [
      '200-amp main breaker',
      '40 circuit spaces',
      'Ground fault protection',
      'NEMA 3R enclosure',
      'Copper bus bars',
      'UL listed'
    ],
    specifications: {
      'Amperage': '200A',
      'Spaces': '40',
      'Enclosure': 'NEMA 3R',
      'Voltage': '120/240V',
      'Phase': 'Single',
      'Protection': 'Ground fault'
    },
    weight: 45.0,
    dimensions: {
      length: 24.0,
      width: 8.0,
      height: 12.0
    },
    shippingClass: 'heavy',
    metaTitle: 'Industrial Circuit Breaker Panel - 200A, 40 Spaces',
    metaDescription: 'Heavy-duty 200-amp circuit breaker panel with ground fault protection for commercial installations.',
    supplier: {
      name: 'PowerGrid Systems',
      contact: '+1-555-0789',
      email: 'supplier@powergrid.com'
    },
    warranty: '5 Year Limited',
    isActive: true,
    isFeatured: false,
    isOnSale: true,
    isInStock: true
  },
  {
    name: 'USB-C Fast Charging Cable',
    description: 'High-quality USB-C cable with fast charging capability, durable braided design, and universal compatibility.',
    sku: 'CABLE-USB-001',
    price: 19.99,
    originalPrice: 24.99,
    costPrice: 8.00,
    stock: 300,
    lowStockThreshold: 50,
    category: 'Cables',
    subcategory: 'USB Cables',
    tags: ['usb-c', 'fast-charging', 'braided', 'universal'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
        alt: 'USB-C Cable',
        isPrimary: true
      }
    ],
    features: [
      'Fast charging compatible',
      'Braided nylon design',
      'Universal compatibility',
      'Durable construction',
      '6ft length',
      'Gold-plated connectors'
    ],
    specifications: {
      'Length': '6ft',
      'Connector Type': 'USB-C to USB-C',
      'Charging Speed': 'Up to 100W',
      'Data Transfer': 'Up to 10Gbps',
      'Material': 'Braided nylon',
      'Connectors': 'Gold-plated'
    },
    weight: 0.2,
    dimensions: {
      length: 72.0,
      width: 0.3,
      height: 0.3
    },
    shippingClass: 'light',
    metaTitle: 'USB-C Fast Charging Cable - 6ft Braided Design',
    metaDescription: 'High-quality USB-C cable with fast charging, braided design, and universal compatibility.',
    supplier: {
      name: 'CableTech Solutions',
      contact: '+1-555-0321',
      email: 'supplier@cabletech.com'
    },
    warranty: '1 Year Limited',
    isActive: true,
    isFeatured: false,
    isOnSale: true,
    isInStock: true
  },
  {
    name: 'Smart WiFi Outlet',
    description: 'WiFi-enabled smart outlet that allows you to control your devices remotely, set schedules, and monitor energy usage.',
    sku: 'OUTLET-SMART-001',
    price: 34.99,
    originalPrice: 44.99,
    costPrice: 22.00,
    stock: 120,
    lowStockThreshold: 25,
    category: 'Switches',
    subcategory: 'Smart Switches',
    tags: ['smart', 'wifi', 'outlet', 'energy-monitoring'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
        alt: 'Smart WiFi Outlet',
        isPrimary: true
      }
    ],
    features: [
      'WiFi connectivity',
      'Remote control',
      'Energy monitoring',
      'Schedule automation',
      'Voice control',
      'Mobile app control'
    ],
    specifications: {
      'Voltage': '120V',
      'Current': '15A',
      'Power': '1800W',
      'WiFi': '2.4GHz',
      'App': 'iOS/Android',
      'Voice Control': 'Alexa, Google'
    },
    weight: 0.4,
    dimensions: {
      length: 2.5,
      width: 2.5,
      height: 1.5
    },
    shippingClass: 'light',
    metaTitle: 'Smart WiFi Outlet - Remote Control & Energy Monitoring',
    metaDescription: 'Control your devices remotely with our Smart WiFi Outlet. Features energy monitoring and voice control.',
    supplier: {
      name: 'SmartHome Tech',
      contact: '+1-555-0654',
      email: 'supplier@smarthome.com'
    },
    warranty: '2 Year Limited',
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    isInStock: true
  }
];

// Sample customers data
const sampleCustomers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'Customer123!',
    phone: '+1-555-0101',
    role: 'customer',
    isActive: true,
    isEmailVerified: true,
    isTemporaryPassword: false,
    customerId: 'CUST001',
    permissions: ['read_products', 'read_orders', 'write_orders']
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'Customer123!',
    phone: '+1-555-0102',
    role: 'customer',
    isActive: true,
    isEmailVerified: true,
    isTemporaryPassword: false,
    customerId: 'CUST002',
    permissions: ['read_products', 'read_orders', 'write_orders']
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB Atlas
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    console.log('   - Products cleared');
    
    // Don't clear users as they might have important data
    console.log('   - Users preserved (not cleared)');

    // Seed products
    console.log('🌱 Seeding products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`   - ${createdProducts.length} products created`);

    // Display created products
    console.log('\n📦 Created Products:');
    createdProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (SKU: ${product.sku}) - $${product.price}`);
    });

    // Check if test users exist, if not create them
    console.log('\n👥 Checking test users...');
    
    for (const customerData of sampleCustomers) {
      const existingUser = await User.findOne({ 
        $or: [{ email: customerData.email }, { username: customerData.username }] 
      });
      
      if (!existingUser) {
        const newCustomer = new User(customerData);
        await newCustomer.save();
        console.log(`   - Created customer: ${customerData.firstName} ${customerData.lastName}`);
      } else {
        console.log(`   - Customer already exists: ${customerData.firstName} ${customerData.lastName}`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Test customers: ${sampleCustomers.length}`);
    console.log('\n🔑 Test Login Credentials:');
    console.log('   Customer 1: john.doe@example.com / Customer123!');
    console.log('   Customer 2: jane.smith@example.com / Customer123!');
    console.log('   Admin: admin / admin123');
    console.log('   Employee: employee / employee123');

  } catch (error) {
    console.error('❌ Database seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProducts, sampleCustomers };







