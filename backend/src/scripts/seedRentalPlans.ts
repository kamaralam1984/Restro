/**
 * Run: npm run seed-plans
 * Seeds the default rental plans for the platform.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restro-os';

const defaultPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small restaurants getting started with digital management.',
    price: 999,
    yearlyPrice: 9999,
    billingCycle: 'both',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    features: {
      maxMenuItems: 50,
      maxStaff: 3,
      maxTables: 10,
      onlineOrdering: true,
      analytics: false,
      customDomain: false,
      whatsappIntegration: false,
      razorpayIntegration: false,
      emailSupport: true,
    },
  },
  {
    name: 'Pro',
    description: 'For growing restaurants that need online payments and analytics.',
    price: 2499,
    yearlyPrice: 24999,
    billingCycle: 'both',
    trialDays: 14,
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    features: {
      maxMenuItems: 200,
      maxStaff: 10,
      maxTables: 30,
      onlineOrdering: true,
      analytics: true,
      customDomain: false,
      whatsappIntegration: true,
      razorpayIntegration: true,
      emailSupport: true,
    },
  },
  {
    name: 'Enterprise',
    description: 'Unlimited everything for large restaurant chains.',
    price: 4999,
    yearlyPrice: 49999,
    billingCycle: 'both',
    trialDays: 30,
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    features: {
      maxMenuItems: -1,
      maxStaff: -1,
      maxTables: -1,
      onlineOrdering: true,
      analytics: true,
      customDomain: true,
      whatsappIntegration: true,
      razorpayIntegration: true,
      emailSupport: true,
    },
  },
];

async function seedPlans() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const { RentalPlan } = await import('../models/RentalPlan.model.js');

  for (const planData of defaultPlans) {
    const existing = await RentalPlan.findOne({ name: planData.name });
    if (existing) {
      console.log(`Plan "${planData.name}" already exists — skipping.`);
      continue;
    }
    await RentalPlan.create(planData);
    console.log(`✅ Created plan: ${planData.name} (₹${planData.price}/month)`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seedPlans().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
