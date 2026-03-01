/**
 * Run: npm run create-master-admin
 * Creates a platform-level master admin user (separate panel from super admin).
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restro-os';

async function createMasterAdmin() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const { User } = await import('../models/User.model.js');

  const email = process.env.MASTER_ADMIN_EMAIL || 'masteradmin@restroos.com';
  const password = process.env.MASTER_ADMIN_PASSWORD || 'MasterAdmin@123';
  const name = process.env.MASTER_ADMIN_NAME || 'Master Admin';
  const phone = process.env.MASTER_ADMIN_PHONE || '+919999999998';

  const existing = await User.findOne({ email, role: 'master_admin' });
  if (existing) {
    console.log('Master admin already exists:', email);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email,
    phone,
    role: 'master_admin',
    password: hashedPassword,
    restaurantId: null,
    isActive: true,
  });

  console.log('✅ Master admin created successfully');
  console.log('   Email   :', email);
  console.log('   Password:', password);
  console.log('   Login URL: /admin/master/login');

  await mongoose.disconnect();
}

createMasterAdmin().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
