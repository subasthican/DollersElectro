const Product = require('../models/Product');
const axios = require('axios');

// Ollama Configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// AI Response Generation Logic - Now using Ollama!
const generateAIResponse = async (userMessage, aiChat) => {
  const message = userMessage.toLowerCase();
  const context = aiChat.context;
  
  try {
    // Try using Ollama first (Real AI!)
    const ollamaResponse = await callOllamaAPI(userMessage, context, aiChat.conversation);
    
    if (ollamaResponse) {
      return {
        role: 'assistant',
        message: ollamaResponse.message,
        suggestions: ollamaResponse.suggestions || generateSmartSuggestions(userMessage),
        timestamp: new Date()
      };
    }
  } catch (error) {
    console.log('📝 Ollama not available, using fallback responses');
  }
  
  // Fallback to rule-based system if Ollama is not running
  const intent = analyzeIntent(message);
  let response = '';
  let suggestions = [];
  
  switch (intent.type) {
    case 'project_type':
      response = generateProjectTypeResponse(intent.data);
      suggestions = generateProjectSuggestions(intent.data);
      break;
      
    case 'room_specific':
      response = generateRoomResponse(intent.data);
      suggestions = generateRoomSuggestions(intent.data);
      break;
      
    case 'budget_inquiry':
      response = generateBudgetResponse(intent.data);
      suggestions = generateBudgetSuggestions(intent.data);
      break;
      
    case 'product_recommendation':
      response = await generateProductRecommendation(intent.data, context);
      suggestions = generateProductSuggestions(intent.data);
      break;
      
    case 'smart_home':
      response = generateSmartHomeResponse(intent.data);
      suggestions = generateSmartHomeSuggestions(intent.data);
      break;
      
    default:
      response = generateGeneralResponse(message);
      suggestions = generateGeneralSuggestions();
  }
  
  return {
    role: 'assistant',
    message: response,
    suggestions,
    timestamp: new Date()
  };
};

// Call Ollama API (Real AI!)
const callOllamaAPI = async (userMessage, context, conversation = []) => {
  try {
    // Build system prompt with store context
    const systemPrompt = `You are an AI assistant for DollersElectro, an electrical supplies store. 
Help customers find the right electrical products, provide recommendations, and answer questions about:
- Electrical components (switches, sockets, wiring, etc.)
- Smart home products
- Lighting solutions
- Home automation
- Safety and installation advice
- Budget planning

Be friendly, helpful, and knowledgeable. Keep responses concise (2-3 sentences) and suggest related products when appropriate.`;

    // Build conversation history for context
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add recent conversation history (last 4 messages)
    const recentConvo = conversation.slice(-4);
    recentConvo.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.message
      });
    });
    
    // Add current message
    messages.push({ role: 'user', content: userMessage });
    
    // Build full prompt for Ollama
    let fullPrompt = systemPrompt + '\n\n';
    recentConvo.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.message}\n`;
    });
    fullPrompt += `Customer: ${userMessage}\nAssistant:`;

    // Call Ollama API
    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 200
      }
    }, {
      timeout: 30000 // 30 second timeout
    });

    if (response.data && response.data.response) {
      return {
        message: response.data.response.trim(),
        suggestions: generateSmartSuggestions(userMessage)
      };
    }
    
    return null;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Ollama is not running. Start it with: ollama serve');
    } else {
      console.error('❌ Ollama API Error:', error.message);
    }
    return null;
  }
};

// Generate smart follow-up suggestions
const generateSmartSuggestions = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('house') || message.includes('building')) {
    return [
      { text: 'What rooms need wiring?' },
      { text: 'Do you need smart home features?' },
      { text: 'Show me lighting options' }
    ];
  }
  
  if (message.includes('kitchen') || message.includes('bathroom')) {
    return [
      { text: 'Recommend waterproof solutions' },
      { text: 'What about lighting?' },
      { text: 'Show me popular products' }
    ];
  }
  
  if (message.includes('budget') || message.includes('price')) {
    return [
      { text: 'Show affordable options' },
      { text: 'What are premium alternatives?' },
      { text: 'Any package deals?' }
    ];
  }
  
  return [
    { text: 'Tell me about smart home' },
    { text: 'What do you recommend?' },
    { text: 'Show popular products' }
  ];
};

// Intent Analysis
const analyzeIntent = (message) => {
  if (message.includes('house') || message.includes('home') || message.includes('building')) {
    return { type: 'project_type', data: 'house' };
  }
  
  if (message.includes('office') || message.includes('workplace') || message.includes('commercial')) {
    return { type: 'project_type', data: 'office' };
  }
  
  if (message.includes('renovation') || message.includes('remodel') || message.includes('upgrade')) {
    return { type: 'project_type', data: 'renovation' };
  }
  
  if (message.includes('kitchen') || message.includes('bathroom') || message.includes('bedroom') || message.includes('living room')) {
    return { type: 'room_specific', data: extractRoomType(message) };
  }
  
  if (message.includes('budget') || message.includes('cost') || message.includes('price') || message.includes('cheap') || message.includes('expensive')) {
    return { type: 'budget_inquiry', data: extractBudgetLevel(message) };
  }
  
  if (message.includes('smart') || message.includes('automation') || message.includes('wifi') || message.includes('bluetooth')) {
    return { type: 'smart_home', data: 'smart_home' };
  }
  
  if (message.includes('need') || message.includes('recommend') || message.includes('suggest') || message.includes('what')) {
    return { type: 'product_recommendation', data: extractProductType(message) };
  }
  
  return { type: 'general', data: null };
};

// Extract room type from message
const extractRoomType = (message) => {
  if (message.includes('kitchen')) return 'kitchen';
  if (message.includes('bathroom')) return 'bathroom';
  if (message.includes('bedroom')) return 'bedroom';
  if (message.includes('living room') || message.includes('livingroom')) return 'living_room';
  if (message.includes('dining')) return 'dining_room';
  if (message.includes('garage')) return 'garage';
  if (message.includes('basement')) return 'basement';
  return 'general';
};

// Extract budget level from message
const extractBudgetLevel = (message) => {
  if (message.includes('cheap') || message.includes('low') || message.includes('budget') || message.includes('affordable')) {
    return 'low';
  }
  if (message.includes('expensive') || message.includes('high') || message.includes('luxury') || message.includes('premium')) {
    return 'high';
  }
  return 'medium';
};

// Extract product type from message
const extractProductType = (message) => {
  if (message.includes('light') || message.includes('bulb') || message.includes('lamp')) return 'lighting';
  if (message.includes('switch') || message.includes('outlet') || message.includes('socket')) return 'switches';
  if (message.includes('wire') || message.includes('cable')) return 'wiring';
  if (message.includes('fan') || message.includes('ventilation')) return 'ventilation';
  if (message.includes('security') || message.includes('camera')) return 'security';
  return 'general';
};

// Generate project type responses
const generateProjectTypeResponse = (projectType) => {
  const responses = {
    house: "Excellent choice! Building a new house gives you the perfect opportunity to plan your electrical system from scratch. Let me help you design the ideal electrical setup. What type of house are you planning?",
    office: "Great idea! Office electrical systems need to handle both functionality and efficiency. Let me suggest some commercial-grade solutions that will keep your workspace running smoothly.",
    renovation: "Smart thinking! Renovating gives you the chance to upgrade to modern electrical standards. Let me help you identify what needs updating and suggest the best products."
  };
  
  return responses[projectType] || "That sounds like an exciting project! Let me help you plan your electrical needs.";
};

// Generate project suggestions
const generateProjectSuggestions = (projectType) => {
  const suggestions = {
    house: [
      { text: "Modern smart home", action: "project_style", data: "smart_home" },
      { text: "Traditional family home", action: "project_style", data: "traditional" },
      { text: "Energy-efficient home", action: "project_style", data: "energy_efficient" },
      { text: "Luxury custom home", action: "project_style", data: "luxury" }
    ],
    office: [
      { text: "Small office setup", action: "office_size", data: "small" },
      { text: "Large commercial space", action: "office_size", data: "large" },
      { text: "Industrial workspace", action: "office_size", data: "industrial" }
    ],
    renovation: [
      { text: "Kitchen upgrade", action: "room_focus", data: "kitchen" },
      { text: "Bathroom modernization", action: "room_focus", data: "bathroom" },
      { text: "Whole house upgrade", action: "room_focus", data: "whole_house" }
    ]
  };
  
  return suggestions[projectType] || [
    { text: "Tell me more about your project", action: "general", data: "more_info" }
  ];
};

// Generate room-specific responses
const generateRoomResponse = (roomType) => {
  const responses = {
    kitchen: "The kitchen is the heart of the home and needs reliable electrical systems! You'll need proper lighting, outlets for appliances, and possibly smart features. What's your budget for the kitchen electrical setup?",
    bathroom: "Bathroom electrical work requires special attention to safety and moisture resistance. Let me suggest some waterproof and GFCI-protected solutions. Are you looking for basic functionality or luxury features?",
    bedroom: "Bedrooms need comfortable lighting and convenient outlets for devices. Let me help you create a relaxing and functional electrical setup. Do you want smart features or traditional switches?",
    living_room: "The living room is where you entertain and relax! You'll want good lighting, entertainment system connections, and maybe some smart home features. What's your vision for the space?"
  };
  
  return responses[roomType] || "That's a great room to focus on! Let me help you plan the electrical needs for that space.";
};

// Generate room suggestions
const generateRoomSuggestions = (roomType) => {
  const suggestions = {
    kitchen: [
      { text: "Under-cabinet lighting", action: "product_type", data: "kitchen_lighting" },
      { text: "Appliance outlets", action: "product_type", data: "kitchen_outlets" },
      { text: "Smart switches", action: "product_type", data: "smart_switches" }
    ],
    bathroom: [
      { text: "Waterproof lighting", action: "product_type", data: "bathroom_lighting" },
      { text: "GFCI outlets", action: "product_type", data: "gfci_outlets" },
      { text: "Heated towel rack", action: "product_type", data: "heated_accessories" }
    ],
    bedroom: [
      { text: "Bedside lighting", action: "product_type", data: "bedroom_lighting" },
      { text: "USB outlets", action: "product_type", data: "usb_outlets" },
      { text: "Smart dimmers", action: "product_type", data: "smart_dimmers" }
    ]
  };
  
  return suggestions[roomType] || [
    { text: "What specific electrical needs do you have?", action: "general", data: "specific_needs" }
  ];
};

// Generate budget responses
const generateBudgetResponse = (budgetLevel) => {
  const responses = {
    low: "I understand you're working with a budget! Let me suggest some cost-effective solutions that still provide quality and safety. We can start with essential items and add upgrades later.",
    medium: "A medium budget gives us good options! We can include some smart features and quality products while keeping costs reasonable. Let me suggest a balanced approach.",
    high: "With a higher budget, we can explore premium products, smart home automation, and luxury features. Let me suggest some high-end solutions that will make your space exceptional."
  };
  
  return responses[budgetLevel] || "Budget is an important consideration! Let me help you find the right balance of quality and value.";
};

// Generate budget suggestions
const generateBudgetSuggestions = (budgetLevel) => {
  const suggestions = {
    low: [
      { text: "Essential package", action: "package_type", data: "essential" },
      { text: "Basic upgrades", action: "package_type", data: "basic" },
      { text: "DIY-friendly options", action: "package_type", data: "diy" }
    ],
    medium: [
      { text: "Standard package", action: "package_type", data: "standard" },
      { text: "Smart features", action: "package_type", data: "smart" },
      { text: "Quality essentials", action: "package_type", data: "quality" }
    ],
    high: [
      { text: "Premium package", action: "package_type", data: "premium" },
      { text: "Full automation", action: "package_type", data: "automation" },
      { text: "Luxury features", action: "package_type", data: "luxury" }
    ]
  };
  
  return suggestions[budgetLevel] || [
    { text: "What's your budget range?", action: "budget", data: "specify" }
  ];
};

// Generate smart home responses
const generateSmartHomeResponse = (type) => {
  return "Smart home technology is fantastic! You can control lighting, security, and appliances from your phone. Let me suggest some smart electrical products that will make your home more convenient and energy-efficient.";
};

// Generate smart home suggestions
const generateSmartHomeSuggestions = (type) => {
  return [
    { text: "Smart lighting system", action: "product_type", data: "smart_lighting" },
    { text: "Smart switches and outlets", action: "product_type", data: "smart_switches" },
    { text: "Home automation hub", action: "product_type", data: "automation_hub" },
    { text: "Smart security system", action: "product_type", data: "smart_security" }
  ];
};

// Generate product recommendation response
const generateProductRecommendation = async (productType, context) => {
  return `Great! Let me suggest some ${productType} products that would be perfect for your project. I'll create a customized package based on your needs and budget.`;
};

// Generate product suggestions
const generateProductSuggestions = (productType) => {
  return [
    { text: "Show me the best options", action: "view_products", data: productType },
    { text: "Create a package", action: "create_package", data: productType },
    { text: "Compare products", action: "compare_products", data: productType }
  ];
};

// Generate general response
const generateGeneralResponse = (message) => {
  return "I'm here to help you plan your electrical project! Whether you're building new, renovating, or just upgrading, I can suggest the right products and packages. What would you like to know more about?";
};

// Generate general suggestions
const generateGeneralSuggestions = () => {
  return [
    { text: "Tell me about your project", action: "project_info", data: "start" },
    { text: "Show me popular packages", action: "view_packages", data: "popular" },
    { text: "Ask about specific products", action: "product_info", data: "browse" }
  ];
};

// Generate Product Recommendations
const generateRecommendations = async (aiChat) => {
  const { context } = aiChat;
  const recommendations = [];
  
  try {
    if (context.projectType === 'house') {
      // Kitchen Package
      const kitchenProducts = await Product.find({
        category: { $in: ['kitchen', 'lighting', 'switches'] },
        price: { $lte: getBudgetLimit(context.budget) }
      }).limit(5);
      
      if (kitchenProducts.length > 0) {
        recommendations.push({
          category: 'Kitchen Essentials',
          products: kitchenProducts.map(p => ({
            productId: p._id,
            reason: 'Essential for modern kitchen functionality',
            priority: 'high'
          })),
          packageName: 'Kitchen Electrical Package',
          totalPrice: calculatePackagePrice(kitchenProducts),
          savings: calculateSavings(kitchenProducts)
        });
      }
      
      // Living Room Package
      const livingRoomProducts = await Product.find({
        category: { $in: ['entertainment', 'lighting', 'smart_home'] },
        price: { $lte: getBudgetLimit(context.budget) }
      }).limit(5);
      
      if (livingRoomProducts.length > 0) {
        recommendations.push({
          category: 'Living Room Setup',
          products: livingRoomProducts.map(p => ({
            productId: p._id,
            reason: 'Creates comfortable and functional living space',
            priority: 'medium'
          })),
          packageName: 'Living Room Package',
          totalPrice: calculatePackagePrice(livingRoomProducts),
          savings: calculateSavings(livingRoomProducts)
        });
      }
    }
    
    // Smart Home Package
    if (context.preferences && context.preferences.includes('smart_home')) {
      const smartProducts = await Product.find({
        category: { $in: ['smart_home', 'automation'] },
        price: { $lte: getBudgetLimit(context.budget) }
      }).limit(5);
      
      if (smartProducts.length > 0) {
        recommendations.push({
          category: 'Smart Home Upgrade',
          products: smartProducts.map(p => ({
            productId: p._id,
            reason: 'Modern automation for convenience and efficiency',
            priority: 'medium'
          })),
          packageName: 'Smart Home Package',
          totalPrice: calculatePackagePrice(smartProducts),
          savings: calculateSavings(smartProducts)
        });
      }
    }
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
  }
  
  return recommendations;
};

// Helper functions
const getBudgetLimit = (budget) => {
  switch (budget) {
    case 'low': return 1000;
    case 'high': return 10000;
    default: return 5000;
  }
};

const calculatePackagePrice = (products) => {
  return products.reduce((total, product) => total + (product.price || 0), 0);
};

const calculateSavings = (products) => {
  const totalPrice = calculatePackagePrice(products);
  return Math.round(totalPrice * 0.15); // 15% savings estimate
};

// Update context based on user message
const updateContext = async (aiChat, message) => {
  const intent = analyzeIntent(message);
  
  if (!aiChat.context) {
    aiChat.context = {};
  }
  
  switch (intent.type) {
    case 'project_type':
      aiChat.context.projectType = intent.data;
      break;
    case 'room_specific':
      if (!aiChat.context.roomTypes) aiChat.context.roomTypes = [];
      if (!aiChat.context.roomTypes.includes(intent.data)) {
        aiChat.context.roomTypes.push(intent.data);
      }
      break;
    case 'budget_inquiry':
      aiChat.context.budget = intent.data;
      break;
    case 'smart_home':
      if (!aiChat.context.preferences) aiChat.context.preferences = [];
      if (!aiChat.context.preferences.includes('smart_home')) {
        aiChat.context.preferences.push('smart_home');
      }
      break;
  }
  
  aiChat.lastActivity = new Date();
};

// Generate general response for unmatched intents

module.exports = {
  generateAIResponse,
  generateRecommendations,
  updateContext
};












