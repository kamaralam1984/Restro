import { Request, Response } from 'express';
import { Table } from '../models/Table.model';
import { Booking } from '../models/Booking.model';

// Get all tables with availability status for a specific date/time
export const getTables = async (req: Request, res: Response) => {
  try {
    const { date, time } = req.query;

    let tables = await Table.find().sort({ 'location.row': 1, 'location.column': 1 });
    
    // If no tables found, return empty array
    if (!tables || tables.length === 0) {
      console.log('No tables found in database');
      return res.json([]);
    }

    // If date and time provided, check availability
    if (date && time) {
      const bookingDate = new Date(date as string);
      bookingDate.setHours(0, 0, 0, 0);
      const bookingTime = time as string;
      
      // Parse booking time to minutes
      const timeParts = bookingTime.split(':');
      const bookingTimeHours = parseInt(timeParts[0], 10);
      const bookingTimeMinutes = parseInt(timeParts[1], 10) || 0;
      const bookingTimeInMinutes = bookingTimeHours * 60 + bookingTimeMinutes;

      // Create date range for the booking date
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find all bookings for this date
      const bookings = await Booking.find({
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

// Initialize tables (one-time setup)
export const initializeTables = async (req: Request, res: Response) => {
  try {
    const existingTables = await Table.countDocuments();
    if (existingTables > 0) {
      return res.status(400).json({ error: 'Tables already initialized' });
    }

    const tables = [];
    const sections = ['window', 'center', 'corner', 'outdoor'];
    const capacities = [2, 4, 4, 6, 6, 8, 8, 10, 4, 4, 2, 4, 6, 6, 8, 4, 4, 6, 8, 10];

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
    }

    res.status(201).json({
      message: '20 tables initialized successfully',
      tables: tables.length,
    });
  } catch (error: any) {
    console.error('Error initializing tables:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize tables' });
  }
};

