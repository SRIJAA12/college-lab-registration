import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Handle app termination
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📴 ${signal} received. Closing MongoDB connection...`);
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during MongoDB disconnection:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Please check your MongoDB URI and network connection');
    process.exit(1);
  }
};

// Export connection status checker
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Export database stats
export const getDBStats = async () => {
  if (!isConnected()) {
    throw new Error('Database not connected');
  }
  
  const stats = await mongoose.connection.db.stats();
  return {
    collections: stats.collections,
    dataSize: stats.dataSize,
    storageSize: stats.storageSize,
    indexes: stats.indexes,
    objects: stats.objects,
  };
};

export default connectDB;
