/**
 * Run: npm run seed-plans
 * Seeds the default rental plans for the platform.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restro-os';

// Basic: Menu + Orders | Pro: + Booking + Billing | Premium: + Analytics + Staff control
const defaultPlans = [
  {
    name: 'Basic',
    description: 'Menu + Orders. Perfect for getting started.',
    price: 1999,
    yearlyPrice: 19990,
    billingCycle: 'both',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    features: {
      maxMenuItems: 50,
      maxStaff: 2,
      maxTables: 5,
      onlineOrdering: true,
      tableBooking: false,
      billing: false,
      analytics: false,
      staffControl: false,
      customDomain: false,
      whatsappIntegration: false,
      razorpayIntegration: true,
      emailSupport: true,
    },
  },
  {
    name: 'Pro',
    description: 'Menu + Orders + Booking + Billing.',
    price: 3999,
    yearlyPrice: 39990,
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
      tableBooking: true,
      billing: true,
      analytics: false,
      staffControl: false,
      customDomain: false,
      whatsappIntegration: true,
      razorpayIntegration: true,
      emailSupport: true,
    },
  },
  {
    name: 'Premium',
    description: 'Full system: Analytics + Staff control.',
    price: 6999,
    yearlyPrice: 69990,
    billingCycle: 'both',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    features: {
      maxMenuItems: -1,
      maxStaff: -1,
      maxTables: -1,
      onlineOrdering: true,
      tableBooking: true,
      billing: true,
      analytics: true,
      staffControl: true,
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
