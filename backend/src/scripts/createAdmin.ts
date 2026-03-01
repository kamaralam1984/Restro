import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.model';
import { Restaurant } from '../models/Restaurant.model';
import { connectDB } from '../config/db';

dotenv.config();

async function createDefaultAdmin() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@silverplate.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' }).select('+password');
    if (existingAdmin) {
      existingAdmin.password = await bcrypt.hash(adminPassword, 10);
      await existingAdmin.save();
      console.log('✅ Admin password reset successfully');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      process.exit(0);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    let restaurantId = null;
    try {
      const first = await Restaurant.findOne({}).select('_id').lean();
      if (first?._id) restaurantId = first._id;
    } catch {}

    const admin = new User({
      name: 'Admin',
      email: adminEmail,
      phone: '+1234567890',
      role: 'admin',
      password: hashedPassword,
      restaurantId: restaurantId || undefined,
    });

    await admin.save();

    console.log('✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

createDefaultAdmin();

