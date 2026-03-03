/**
 * Run: npm run create-super-admin
 * Idempotent helper for the platform-level super admin user.
 * - If not present, it creates the user.
 * - If already present, it **resets the password** to SUPER_ADMIN_PASSWORD (or the default)
 *   and ensures the role/flags are correct.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restro-os';

async function createSuperAdmin() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Dynamic import to avoid model registration issues
  const { User } = await import('../models/User.model.js');

  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@restroos.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const phone = process.env.SUPER_ADMIN_PHONE || '+919999999999';

  const hashedPassword = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email, restaurantId: null });

  if (existing) {
    existing.name = name;
    existing.phone = phone;
    existing.role = 'super_admin';
    existing.password = hashedPassword;
    existing.restaurantId = null;
    existing.isActive = true;
    await existing.save();

    console.log('♻️  Super admin already existed, password has been reset.');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    console.log('   ⚠️  Change this password immediately after next login!');
  } else {
    await User.create({
      name,
      email,
      phone,
      role: 'super_admin',
      password: hashedPassword,
      restaurantId: null,
      isActive: true,
    });

    console.log('✅ Super admin created successfully');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    console.log('   ⚠️  Change this password immediately after first login!');
  }

  await mongoose.disconnect();
}

createSuperAdmin().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
