export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  features: string[];
  specifications: Record<string, string>;
  inStock: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  createdAt?: string;
}

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Smart LED Light Bulb Pro',
    description: 'WiFi-enabled smart LED bulb with 16 million colors, voice control, and energy efficiency. Perfect for smart home automation.',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=400&fit=crop',
    category: 'Lighting',
    rating: 4.8,
    reviewCount: 1247,
    stock: 150,
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
    inStock: true,
    isFeatured: true,
    isOnSale: true
  },
  {
    id: '2',
    name: 'Professional Wire Stripper Set',
    description: 'Complete wire stripping kit with 8 different gauge sizes, ergonomic handles, and precision cutting blades for professional electricians.',
    price: 45.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
    category: 'Tools',
    rating: 4.9,
    reviewCount: 892,
    stock: 75,
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
    inStock: true,
    isFeatured: true,
    isOnSale: true
  },
  {
    id: '3',
    name: 'Industrial Circuit Breaker Panel',
    description: 'Heavy-duty 200-amp circuit breaker panel with 40 spaces, main breaker, and ground fault protection for commercial installations.',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
    category: 'Electrical Panels',
    rating: 4.7,
    reviewCount: 156,
    stock: 25,
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
      'Bus Material': 'Copper',
      'Voltage': '120/240V',
      'Certification': 'UL Listed'
    },
    inStock: true,
    isFeatured: true,
    isOnSale: true
  },
  {
    id: '4',
    name: 'Premium Copper Wire (100ft)',
    description: 'High-quality stranded copper wire with THHN insulation, perfect for residential and commercial electrical installations.',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
    category: 'Wiring',
    rating: 4.6,
    reviewCount: 634,
    stock: 200,
    features: [
      'Stranded copper conductor',
      'THHN insulation',
      '600V rating',
      '90°C temperature rating',
      'Oil and sunlight resistant',
      'UL listed'
    ],
    specifications: {
      'Gauge': '12 AWG',
      'Length': '100 feet',
      'Conductor': 'Stranded copper',
      'Insulation': 'THHN',
      'Voltage Rating': '600V',
      'Temperature': '90°C'
    },
    inStock: true,
    isFeatured: false,
    isOnSale: true
  },
  {
    id: '5',
    name: 'Digital Multimeter Pro',
    description: 'Professional digital multimeter with true RMS, auto-ranging, and advanced features for accurate electrical measurements.',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
    category: 'Testing Equipment',
    rating: 4.8,
    reviewCount: 445,
    stock: 60,
    features: [
      'True RMS measurement',
      'Auto-ranging',
      'Backlit display',
      'Data hold function',
      'Auto power off',
      'CAT III 600V safety rating'
    ],
    specifications: {
      'Voltage Range': '0.1mV-600V',
      'Current Range': '0.1μA-10A',
      'Resistance': '0.1Ω-40MΩ',
      'Display': '3¾ digit LCD',
      'Safety': 'CAT III 600V',
      'Battery Life': '200 hours'
    },
    inStock: true,
    isFeatured: true,
    isOnSale: true
  },
  {
    id: '6',
    name: 'Smart Home Hub Controller',
    description: 'Central hub for smart home automation, compatible with Z-Wave, Zigbee, and WiFi devices for complete home control.',
    price: 149.99,
    originalPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=400&fit=crop',
    category: 'Smart Home',
    rating: 4.7,
    reviewCount: 789,
    stock: 45,
    features: [
      'Z-Wave & Zigbee support',
      'WiFi connectivity',
      'Mobile app control',
      'Voice assistant integration',
      'Automation rules',
      'Cloud backup'
    ],
    specifications: {
      'Protocols': 'Z-Wave, Zigbee, WiFi',
      'Range': 'Up to 150ft',
      'Devices': 'Up to 200',
      'Power': '5V/2A',
      'Connectivity': 'WiFi 802.11n',
      'Storage': '8GB internal'
    },
    inStock: true,
    isFeatured: false,
    isOnSale: true
  },
  {
    id: '7',
    name: 'Heavy Duty Extension Cord',
    description: 'Industrial-grade extension cord with 12-gauge wire, 50-foot length, and weather-resistant construction for outdoor use.',
    price: 34.99,
    originalPrice: 44.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
    category: 'Cables & Cords',
    rating: 4.5,
    reviewCount: 321,
    stock: 120,
    features: [
      '12-gauge wire',
      '50-foot length',
      'Weather resistant',
      'Heavy duty construction',
      'Ground fault protection',
      'UL listed'
    ],
    specifications: {
      'Gauge': '12 AWG',
      'Length': '50 feet',
      'Rating': '15A/1875W',
      'Voltage': '125V',
      'Jacket': 'Weather resistant',
      'Connectors': '3-prong grounded'
    },
    inStock: true,
    isFeatured: false,
    isOnSale: true
  },
  {
    id: '8',
    name: 'LED Strip Lights Kit',
    description: 'RGB LED strip lights with remote control, adhesive backing, and 16 million colors for ambient lighting and decoration.',
    price: 24.99,
    originalPrice: 34.99,
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=400&fit=crop',
    category: 'Lighting',
    rating: 4.4,
    reviewCount: 567,
    stock: 200,
    features: [
      '16 million colors',
      'Remote control',
      'Adhesive backing',
      'Music sync mode',
      'Timer function',
      'Dimmable'
    ],
    specifications: {
      'Length': '16.4 feet',
      'LEDs': '300 LEDs',
      'Power': '24W',
      'Voltage': '12V DC',
      'Control': '24-key remote',
      'Adhesive': '3M backing'
    },
    inStock: true,
    isFeatured: false,
    isOnSale: true
  },
  {
    id: '9',
    name: 'Professional Soldering Station',
    description: 'Digital soldering station with temperature control, LCD display, and ceramic heating element for precision soldering work.',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a9c1d0c?w=400&h=400&fit=crop',
    category: 'Tools',
    rating: 4.6,
    reviewCount: 234,
    stock: 35,
    features: [
      'Temperature control',
      'LCD display',
      'Ceramic heating element',
      'Temperature range 200-480°C',
      'Auto sleep mode',
      'Replaceable tips'
    ],
    specifications: {
      'Temperature Range': '200-480°C',
      'Power': '60W',
      'Display': 'LCD digital',
      'Heating Element': 'Ceramic',
      'Tip Compatibility': '900M series',
      'Auto Sleep': 'Yes'
    },
    inStock: true,
    isFeatured: false,
    isOnSale: true
  },
  {
    id: '10',
    name: 'Security Camera System',
    description: '4K security camera system with night vision, motion detection, and mobile app monitoring for home and business security.',
    price: 199.99,
    originalPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1d0c?w=400&h=400&fit=crop',
    category: 'Security',
    rating: 4.7,
    reviewCount: 456,
    stock: 30,
    features: [
      '4K resolution',
      'Night vision',
      'Motion detection',
      'Mobile app control',
      'Cloud storage',
      'Two-way audio'
    ],
    specifications: {
      'Resolution': '4K (3840x2160)',
      'Night Vision': 'Up to 100ft',
      'Field of View': '130°',
      'Storage': '1TB HDD included',
      'Connectivity': 'WiFi + Ethernet',
      'Power': 'PoE or 12V DC'
    },
    inStock: true,
    isFeatured: true,
    isOnSale: true
  }
];

export const getFeaturedProducts = (): Product[] => {
  return sampleProducts.filter(product => product.isFeatured);
};

export const getProductsByCategory = (category: string): Product[] => {
  return sampleProducts.filter(product => product.category === category);
};

export const getProductsOnSale = (): Product[] => {
  return sampleProducts.filter(product => product.isOnSale);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return sampleProducts.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};
