import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Table } from '../models/Table.model';
import { Booking } from '../models/Booking.model';
import { Restaurant } from '../models/Restaurant.model';

async function resolveRestaurantId(restaurantSlugOrId: string | undefined, req: Request): Promise<mongoose.Types.ObjectId | null> {
  if (!restaurantSlugOrId) {
    const uid = (req as any).user?.restaurantId;
    if (uid) return mongoose.Types.ObjectId.isValid(uid) ? new mongoose.Types.ObjectId(uid) : null;
    return null;
  }
  if (mongoose.Types.ObjectId.isValid(restaurantSlugOrId) && restaurantSlugOrId.length === 24) {
    return new mongoose.Types.ObjectId(restaurantSlugOrId);
  }
  const rest = await Restaurant.findOne({ slug: restaurantSlugOrId }).select('_id').lean();
  return rest ? (rest._id as mongoose.Types.ObjectId) : null;
}

// Get all tables with availability status for a specific date/time (filter by restaurant)
export const getTables = async (req: Request, res: Response) => {
  try {
    const { date, time, restaurant: restaurantParam } = req.query;
    const restaurantId = await resolveRestaurantId(restaurantParam as string | undefined, req);
    if (!restaurantId) {
      return res.json([]);
    }

    let tables = await Table.find({ restaurantId }).sort({ 'location.row': 1, 'location.column': 1 });
    
    if (!tables || tables.length === 0) {
      return res.json([]);
    }

    // If date and time provided, check availability
    if (date && time) {
      const bookingDate = new Date(date as string);
      bookingDate.setHours(0, 0, 0, 0);
      const bookingTime = time as string;
      
      const timeParts = bookingTime.split(':');
      const bookingTimeHours = parseInt(timeParts[0], 10);
      const bookingTimeMinutes = parseInt(timeParts[1], 10) || 0;
      const bookingTimeInMinutes = bookingTimeHours * 60 + bookingTimeMinutes;

      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      const bookings = await Booking.find({
        restaurantId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: { $in: ['pending', 'confirmed'] },
      });

      // Check for overlapping time slots
      const bookedTableNumbers = new Set<string>();
      
      for (const booking of bookings) {
        if (!booking.tableNumber) continue;
        
        // Parse booking start time
        const bookingStartParts = booking.time.split(':');
        const bookingStartHours = parseInt(bookingStartParts[0], 10);
        const bookingStartMinutes = parseInt(bookingStartParts[1], 10) || 0;
        const bookingStartInMinutes = bookingStartHours * 60 + bookingStartMinutes;
        
        // Calculate booking end time
        const bookingHours = booking.bookingHours || 1;
        const bookingEndInMinutes = bookingStartInMinutes + (bookingHours * 60);
        
        // Check if the requested time overlaps with this booking
        // For now, we'll check if the requested time falls within any booking
        // In a real scenario, you'd also need the requested booking hours
        // But for display purposes, we'll mark as booked if time matches or is close
        if (
          (bookingTimeInMinutes >= bookingStartInMinutes && bookingTimeInMinutes < bookingEndInMinutes) ||
          (bookingTimeInMinutes < bookingStartInMinutes && bookingTimeInMinutes + 60 > bookingStartInMinutes)
        ) {
          bookedTableNumbers.add(booking.tableNumber);
        }
      }

      const tablesWithStatus = tables.map((table) => {
        const tableObj = table.toObject();
        if (bookedTableNumbers.has(table.tableNumber)) {
          tableObj.status = 'booked';
        } else if (tableObj.status === 'booked' && !bookedTableNumbers.has(table.tableNumber)) {
          tableObj.status = 'available';
        }
        return tableObj;
      });
      return res.json(tablesWithStatus);
    }

    res.json(tables);
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tables' });
  }
};

// Get single table
export const getTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const table = await Table.findById(id);

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(table);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch table' });
  }
};

// Check table availability for specific date/time
export const checkTableAvailability = async (req: Request, res: Response) => {
  try {
    const { tableNumber, date, time, numberOfGuests } = req.body;

    if (!tableNumber || !date || !time) {
      return res.status(400).json({ error: 'Table number, date, and time are required' });
    }

    const table = await Table.findOne({ tableNumber });
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Check if table capacity is sufficient
    if (numberOfGuests && numberOfGuests > table.capacity) {
      return res.status(400).json({
        available: false,
        reason: `Table ${tableNumber} can only accommodate ${table.capacity} guests`,
      });
    }

    // Check for existing bookings
    const bookingDate = new Date(date);
    const existingBooking = await Booking.findOne({
      tableNumber,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
      },
      time,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingBooking) {
      return res.json({
        available: false,
        reason: 'Table is already booked for this time slot',
      });
    }

    res.json({
      available: true,
      table: table.toJSON(),
    });
  } catch (error: any) {
    console.error('Error checking table availability:', error);
    res.status(500).json({ error: error.message || 'Failed to check availability' });
  }
};

// Update table status (admin only)
export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, currentBooking, bookedUntil } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (currentBooking !== undefined) updateData.currentBooking = currentBooking;
    if (bookedUntil) updateData.bookedUntil = bookedUntil;

    const table = await Table.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(table);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update table status' });
  }
};

/** Resolve table by id and ensure it belongs to admin's restaurant (if JWT has restaurantId) */
async function getTableForAdmin(id: string, req: Request): Promise<InstanceType<typeof Table> | null> {
  const table = await Table.findById(id);
  if (!table) return null;
  const restaurantId = (req as any).user?.restaurantId;
  if (restaurantId && table.restaurantId.toString() !== restaurantId.toString()) {
    return null;
  }
  return table;
}

// Update table rate and offer (admin only) – per-table booking rate and discount offer
export const updateTableRateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hourlyRate, discountThreshold, discountAmount } = req.body;

    const table = await getTableForAdmin(id, req);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const setData: Record<string, number> = {};
    const unsetData: Record<string, 1> = {};
    if (hourlyRate !== undefined) {
      if (hourlyRate === null || hourlyRate === '') unsetData.hourlyRate = 1;
      else {
        const v = Number(hourlyRate);
        if (Number.isFinite(v) && v >= 0) setData.hourlyRate = v;
        else unsetData.hourlyRate = 1;
      }
    }
    if (discountThreshold !== undefined) {
      if (discountThreshold === null || discountThreshold === '') unsetData.discountThreshold = 1;
      else {
        const v = Number(discountThreshold);
        if (Number.isFinite(v) && v >= 0) setData.discountThreshold = v;
        else unsetData.discountThreshold = 1;
      }
    }
    if (discountAmount !== undefined) {
      if (discountAmount === null || discountAmount === '') unsetData.discountAmount = 1;
      else {
        const v = Number(discountAmount);
        if (Number.isFinite(v) && v >= 0) setData.discountAmount = v;
        else unsetData.discountAmount = 1;
      }
    }

    const update: any = {};
    if (Object.keys(setData).length) update.$set = setData;
    if (Object.keys(unsetData).length) update.$unset = unsetData;
    if (Object.keys(update).length === 0) {
      return res.json(table);
    }

    const updated = await Table.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating table rate/offer:', error);
    res.status(400).json({ error: error.message || 'Failed to update table rate/offer' });
  }
};

const TABLE_SECTIONS = ['window', 'center', 'corner', 'outdoor'];
const TABLE_CAPACITIES = [2, 4, 4, 6, 6, 8, 8, 10, 4, 4, 2, 4, 6, 6, 8, 4, 4, 6, 8, 10];

/** Create 20 default tables for a restaurant (used on signup or when admin clicks Initialize) */
export async function createDefaultTablesForRestaurant(restaurantId: mongoose.Types.ObjectId): Promise<number> {
  const existingCount = await Table.countDocuments({ restaurantId });
  if (existingCount > 0) return 0;
  for (let i = 0; i < 20; i++) {
    const row = Math.floor(i / 4) + 1;
    const col = (i % 4) + 1;
    const section = TABLE_SECTIONS[Math.floor(i / 5) % TABLE_SECTIONS.length];
    await Table.create({
      restaurantId,
      tableNumber: `T${(i + 1).toString().padStart(2, '0')}`,
      capacity: TABLE_CAPACITIES[i],
      status: 'available',
      location: { row, column: col, section },
    });
  }
  return 20;
}

// Initialize tables for the current restaurant (admin only)
export const initializeTables = async (req: Request, res: Response) => {
  try {
    // Prefer explicit restaurant slug/id from body or query; fall back to JWT restaurantId
    const restaurantParam =
      (req.body && (req.body.restaurant as string | undefined)) ||
      (req.query.restaurant as string | undefined) ||
      ((req as any).user?.restaurantId as string | undefined);

    const restaurantId = await resolveRestaurantId(restaurantParam, req);
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required. Login as restaurant admin.' });
    }

    const created = await createDefaultTablesForRestaurant(restaurantId);
    if (created === 0) {
      return res.status(400).json({ error: 'Tables already initialized for this restaurant' });
    }

    res.status(201).json({
      message: '20 tables initialized successfully for your restaurant',
      tables: created,
    });
  } catch (error: any) {
    console.error('Error initializing tables:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize tables' });
  }
};

