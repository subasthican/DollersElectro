const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoAtlasConnection() {
  try {
    console.log('🔌 Testing MongoDB Atlas connection...');
    console.log('📡 Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      return;
    }

    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('🗄️  Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);

    // Test creating a collection
    const testCollection = mongoose.connection.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'MongoDB Atlas connection test successful!' 
    });
    console.log('✅ Successfully created test document!');

    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('🧹 Cleaned up test document');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed successfully');

  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Tip: Check your username and password in the connection string');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tip: Check your network access settings in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Tip: Check your cluster URL in the connection string');
    }
  }
}

// Run the test
testMongoAtlasConnection();
