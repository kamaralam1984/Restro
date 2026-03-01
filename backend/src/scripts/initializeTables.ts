import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Table } from '../models/Table.model';
import { connectDB } from '../config/db';

dotenv.config();

async function initializeTables() {
  try {
    await connectDB();

    const existingTables = await Table.countDocuments();
    if (existingTables > 0) {
      console.log(`✅ Tables already exist (${existingTables} tables found)`);
      process.exit(0);
    }

    console.log('🔄 Initializing 20 tables...');

    const tables = [];
    const sections = ['window', 'center', 'corner', 'outdoor'];
    // Capacity distribution:
    // T01-T04: 6 persons (4 tables)
    // T05-T08: 4 persons (4 tables)
    // T09-T20: 2 persons (12 tables)
    const capacities = [6, 6, 6, 6, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

    // Create 20 tables in a 5x4 grid layout
    for (let i = 0; i < 20; i++) {
      const row = Math.floor(i / 4) + 1;
      const col = (i % 4) + 1;
      const section = sections[Math.floor(i / 5) % sections.length];

      const table = new Table({
        tableNumber: `T${(i + 1).toString().padStart(2, '0')}`,
        capacity: capacities[i],
        status: 'available',
        location: {
          row,
          column: col,
          section,
        },
      });

      await table.save();
      tables.push(table);
      console.log(`✅ Created table ${table.tableNumber} (${table.capacity} seats, ${section} section)`);
    }

    console.log(`\n✅ Successfully initialized ${tables.length} tables!`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error initializing tables:', error);
    process.exit(1);
  }
}

initializeTables();

