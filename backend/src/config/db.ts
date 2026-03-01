import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Use MongoDB URI as is (should include database name)
const connectionURI = MONGODB_URI;

// Connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  retryWrites: true,
  w: 'majority',
};

// Track connection status
let isConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    // Don't reconnect if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      isConnected = true;
      return;
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(connectionURI, mongooseOptions);
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'silverplate'}`);
  } catch (error: any) {
    isConnected = false;
    console.error('❌ MongoDB connection error:', error.message);
    
    // Don't exit in development, allow retry
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Retrying connection in 5 seconds...');
      setTimeout(() => connectDB(), 5000);
    }
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('✅ MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️  MongoDB disconnected');
  // Attempt to reconnect
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔄 Attempting to reconnect...');
    setTimeout(() => connectDB(), 5000);
  }
});

mongoose.connection.on('error', (error) => {
  isConnected = false;
  console.error('❌ MongoDB error:', error);
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed through app termination');
  process.exit(0);
});

// Export connection status
export const getConnectionStatus = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const isDBConnected = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

