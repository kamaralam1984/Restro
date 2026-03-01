import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Table } from '../models/Table.model';

dotenv.config();

async function updateTableCapacities() {
  try {
    await connectDB();

    const tables = await Table.find().sort({ tableNumber: 1 });
    if (!tables || tables.length === 0) {
      console.log('❌ No tables found. Run "npm run init-tables" first.');
      process.exit(0);
    }

    if (tables.length !== 20) {
      console.log(`⚠️ Expected 20 tables, found ${tables.length}. Updating available tables anyway.`);
    }

    // Capacity distribution:
    // First 4 tables: 6 persons
    // Next 4 tables: 4 persons
    // Remaining tables: 2 persons
    for (let i = 0; i < tables.length; i++) {
      let capacity = 2;
      if (i < 4) {
        capacity = 6;
      } else if (i < 8) {
        capacity = 4;
      }

      const table = tables[i];
      table.capacity = capacity;
      await table.save();
      console.log(`✅ Updated ${table.tableNumber} -> ${capacity} persons`);
    }

    console.log('\n✅ Table capacities updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update table capacities:', error);
    process.exit(1);
  }
}

updateTableCapacities();


