import app from './src/app';
import { connectDB } from './src/config/db';
import { validateEnv, env } from './src/config/env';
import { processExpiredSubscriptions } from './src/services/subscriptionExpiry.service';

// Validate environment variables
validateEnv();

const SUBSCRIPTION_EXPIRY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Start server and connect to database
const startServer = async () => {
  try {
    await connectDB();

    // Run subscription expiry on start and then every hour
    processExpiredSubscriptions()
      .then(({ processed }) => {
        if (processed > 0) console.log(`⚠️  Subscription expiry: ${processed} restaurant(s) set inactive`);
      })
      .catch((err) => console.error('Subscription expiry check failed:', err));
    setInterval(() => {
      processExpiredSubscriptions()
        .then(({ processed }) => {
          if (processed > 0) console.log(`⚠️  Subscription expiry: ${processed} restaurant(s) set inactive`);
        })
        .catch((err) => console.error('Subscription expiry check failed:', err));
    }, SUBSCRIPTION_EXPIRY_INTERVAL_MS);

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

