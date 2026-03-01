import { Request, Response } from 'express';
import { Booking } from '../models/Booking.model';
import { Table } from '../models/Table.model';
import { orderService } from '../services/order.service';
import { 
  getBookingConfig, 
  validateAdvanceBooking, 
  validateTimeSlot, 
  calculateEndTime, 
  calculateBookingAmount 
} from '../utils/booking.utils';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, date, time, numberOfGuests, specialRequests, bookingHours } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !date || !time || !numberOfGuests) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate booking hours (default to 1 if not provided)
    const bookingHoursNum = bookingHours ? parseInt(bookingHours.toString(), 10) : 1;
    if (isNaN(bookingHoursNum) || bookingHoursNum < 1 || bookingHoursNum > 12) {
      return res.status(400).json({ error: 'Booking hours must be between 1 and 12' });
    }

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    bookingDate.setHours(0, 0, 0, 0);

    // Validate and parse time format (HH:MM or HH:MM:SS)
    if (!time || !time.match(/^\d{2}:\d{2}/)) {
      return res.status(400).json({ error: 'Invalid time format. Please use HH:MM format' });
    }

    const timeParts = time.split(':');
    const timeHours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    if (isNaN(timeHours) || isNaN(minutes) || timeHours < 0 || timeHours > 23 || minutes < 0 || minutes > 59) {
      return res.status(400).json({ error: 'Invalid time. Hours must be 0-23 and minutes must be 0-59' });
    }

    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(timeHours, minutes, 0, 0);

    // Format time to HH:MM if it includes seconds
    const formattedTime = time.substring(0, 5);

    // Validate time slot is within allowed hours
    const timeSlotValidation = validateTimeSlot(formattedTime);
    if (!timeSlotValidation.valid) {
      return res.status(400).json({ error: timeSlotValidation.error });
    }

    // Calculate end time
    const endTime = calculateEndTime(formattedTime, bookingHoursNum);
    const endTimeParts = endTime.split(':');
    const endHours = parseInt(endTimeParts[0], 10);
    const endMinutes = parseInt(endTimeParts[1], 10);
    const endTimeMinutes = endHours * 60 + endMinutes;
    
    // Validate end time is within allowed hours
    const endTimeSlotValidation = validateTimeSlot(endTime);
    if (!endTimeSlotValidation.valid) {
      return res.status(400).json({ 
        error: `Booking end time (${endTime}) exceeds allowed booking hours. Maximum booking time is 23:00` 
      });
    }

    // Check for conflicting bookings (overlapping time slots)
    const bookingTimeMinutes = timeHours * 60 + minutes;

    // Create date range for the booking date
    const startOfDayForConflict = new Date(bookingDate);
    startOfDayForConflict.setHours(0, 0, 0, 0);
    const endOfDayForConflict = new Date(bookingDate);
    endOfDayForConflict.setHours(23, 59, 59, 999);

    // Find all bookings for the same date and table
    const existingBookings = await Booking.find({
      date: {
        $gte: startOfDayForConflict,
        $lte: endOfDayForConflict,
      },
      status: { $in: ['pending', 'confirmed'] },
    });

    // Check for time slot overlaps
    for (const existingBooking of existingBookings) {
      const existingTimeParts = existingBooking.time.split(':');
      const existingStartMinutes = parseInt(existingTimeParts[0], 10) * 60 + parseInt(existingTimeParts[1], 10);
      const existingHours = existingBooking.bookingHours || 1;
      const existingEndMinutes = existingStartMinutes + (existingHours * 60);

      // Check if time slots overlap
      if (
        (bookingTimeMinutes >= existingStartMinutes && bookingTimeMinutes < existingEndMinutes) ||
        (endTimeMinutes > existingStartMinutes && endTimeMinutes <= existingEndMinutes) ||
        (bookingTimeMinutes <= existingStartMinutes && endTimeMinutes >= existingEndMinutes)
      ) {
        return res.status(400).json({ 
          error: `Time slot conflict. There's already a booking from ${existingBooking.time} to ${existingBooking.endTime || calculateEndTime(existingBooking.time, existingHours)}. Please choose a different time.`,
        });
      }
    }

    // Validate 2 hours advance booking
    const advanceValidation = validateAdvanceBooking(bookingDate, formattedTime);
    if (!advanceValidation.valid) {
      return res.status(400).json({ error: advanceValidation.error });
    }

    // Handle table selection if provided
    let selectedTableNumber: string | null = null;
    let tableCapacity = null;
    let advancePaymentAmount = 0;
    let totalBookingAmount = 0;
    
    if (req.body.tableNumber) {
      selectedTableNumber = req.body.tableNumber;
      
      // Verify table exists and is available
      const table = await Table.findOne({ tableNumber: selectedTableNumber });
      if (!table) {
        return res.status(400).json({ error: `Table ${selectedTableNumber} not found` });
      }

      tableCapacity = table.capacity;

      // Check if table capacity is sufficient
      if (numberOfGuests > table.capacity) {
        return res.status(400).json({
          error: `Table ${selectedTableNumber} can only accommodate ${table.capacity} guests`,
        });
      }

      // Calculate total booking amount based on hours and table capacity
      totalBookingAmount = calculateBookingAmount(table.capacity, bookingHoursNum);
      
      // Calculate advance payment (first hour rate)
      const bookingConfig = getBookingConfig(table.capacity);
      advancePaymentAmount = bookingConfig.hourlyRate; // Advance payment is 1 hour rate

      // Check if table is already booked for overlapping time slots
      const tableBookings = existingBookings.filter(b => b.tableNumber === selectedTableNumber!);
      for (const existingBooking of tableBookings) {
        const existingTimeParts = existingBooking.time.split(':');
        const existingStartMinutes = parseInt(existingTimeParts[0], 10) * 60 + parseInt(existingTimeParts[1], 10);
        const existingHours = existingBooking.bookingHours || 1;
        const existingEndMinutes = existingStartMinutes + (existingHours * 60);

        // Check if time slots overlap
        if (
          (bookingTimeMinutes >= existingStartMinutes && bookingTimeMinutes < existingEndMinutes) ||
          (endTimeMinutes > existingStartMinutes && endTimeMinutes <= existingEndMinutes) ||
          (bookingTimeMinutes <= existingStartMinutes && endTimeMinutes >= existingEndMinutes)
        ) {
          return res.status(400).json({
            error: `Table ${selectedTableNumber} is already booked from ${existingBooking.time} to ${existingBooking.endTime || calculateEndTime(existingBooking.time, existingHours)}. Please choose a different time.`,
          });
        }
      }
    } else {
      return res.status(400).json({ error: 'Table number is required' });
    }

    const booking = new Booking({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      date: bookingDate,
      time: formattedTime,
      endTime: endTime,
      bookingHours: bookingHoursNum,
      numberOfGuests: parseInt(numberOfGuests.toString(), 10),
      tableNumber: selectedTableNumber || undefined,
      tableCapacity: tableCapacity || undefined,
      specialRequests: specialRequests?.trim() || '',
      status: 'pending',
      advancePayment: advancePaymentAmount,
      totalBookingAmount: totalBookingAmount,
      advancePaymentStatus: 'pending',
      discountApplied: false,
    });

    await booking.save();

    // Update table status if table was selected
    if (selectedTableNumber) {
      const bookingEndDateTime = new Date(bookingDate);
      bookingEndDateTime.setHours(endHours, endMinutes, 0, 0);
      
      await Table.findOneAndUpdate(
        { tableNumber: selectedTableNumber },
        {
          status: 'booked',
          currentBooking: booking._id,
          bookedUntil: bookingEndDateTime,
        }
      );
    }

    // Send WhatsApp notification (don't fail if notification fails)
    try {
      await orderService.sendBookingNotification(booking);
    } catch (notificationError) {
      console.error('Failed to send booking notification:', notificationError);
      // Continue even if notification fails
    }

    // Convert to JSON and ensure id field is available
    const bookingJson = booking.toJSON();
    res.status(201).json({
      ...bookingJson,
      id: bookingJson._id || bookingJson.id,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create booking' });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { status, date } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (date) {
      const filterDate = new Date(date as string);
      if (!isNaN(filterDate.getTime())) {
        const startOfDay = new Date(filterDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filterDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    }

    const bookings = await Booking.find(filter).sort({ date: -1, time: 1 });
    
    // Convert to JSON and ensure id field is available
    const bookingsJson = bookings.map((booking) => {
      const bookingObj = booking.toJSON();
      return {
        ...bookingObj,
        id: bookingObj._id || bookingObj.id,
      };
    });
    
    res.json(bookingsJson);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tableNumber } = req.body;

    const updateData: any = { status };
    if (tableNumber) {
      updateData.tableNumber = tableNumber;
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update booking status' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

