import app from './src/app';
import { connectDB } from './src/config/db';
import { validateEnv, env } from './src/config/env';

// Validate environment variables
validateEnv();

// Start server and connect to database
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server after database connection
    app.listen(env.PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${env.PORT}`);
      console.log(`📦 Environment: ${env.NODE_ENV}`);
      console.log(`✅ Server ready to accept requests`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

