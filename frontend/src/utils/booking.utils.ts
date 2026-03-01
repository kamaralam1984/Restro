// Booking utility functions for frontend

export interface BookingConfig {
  advanceAmount: number;
  discountThreshold: number;
  discountAmount: number;
  durationHours: number;
  minAdvanceHours: number;
  hourlyRate: number;
}

// Booking time slots configuration
export const BOOKING_TIME_SLOTS = {
  startTime: '11:00', // 11:00 AM
  endTime: '23:00',   // 11:00 PM
};

/**
 * Get hourly rate based on table capacity
 */
export function getHourlyRate(capacity: number): number {
  if (capacity >= 6) {
    return 600; // ₹600 per hour for 6+ person table
  } else if (capacity >= 4) {
    return 400; // ₹400 per hour for 4 person table
  } else {
    return 200; // ₹200 per hour for 2 person table
  }
}

/**
 * Calculate total booking amount based on hours and table capacity
 */
export function calculateBookingAmount(capacity: number, hours: number): number {
  const hourlyRate = getHourlyRate(capacity);
  return hourlyRate * hours;
}

/**
 * Get booking configuration based on table capacity
 */
export function getBookingConfig(capacity: number): BookingConfig {
  const hourlyRate = getHourlyRate(capacity);
  
  if (capacity >= 6) {
    return {
      advanceAmount: 600,
      discountThreshold: 1500,
      discountAmount: 600, // 1 hour discount
      durationHours: 1,
      minAdvanceHours: 2,
      hourlyRate: hourlyRate,
    };
  } else if (capacity >= 4) {
    return {
      advanceAmount: 400,
      discountThreshold: 1000,
      discountAmount: 400, // 1 hour discount
      durationHours: 1,
      minAdvanceHours: 2,
      hourlyRate: hourlyRate,
    };
  } else {
    // 2 person table
    return {
      advanceAmount: 200,
      discountThreshold: 500,
      discountAmount: 200, // 1 hour discount
      durationHours: 1,
      minAdvanceHours: 2,
      hourlyRate: hourlyRate,
    };
  }
}

/**
 * Validate if booking is at least 2 hours in advance (STRICT RULE)
 * 
 * RULE:
 * - Booking MUST be at least 2 HOURS (120 minutes) BEFORE the selected booking time
 * - Exactly 2 hours (120 minutes) is ALLOWED
 * - Less than 2 hours (119 minutes or less) is NOT ALLOWED
 * 
 * NOTE: Frontend validation is for UX only. Backend validation is authoritative.
 */
export function validateAdvanceBooking(date: string, time: string): { valid: boolean; error?: string } {
  const now = new Date();
  const bookingDate = new Date(date);
  const timeParts = time.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10) || 0;

  // Create booking datetime
  const bookingDateTime = new Date(bookingDate);
  bookingDateTime.setHours(hours, minutes, 0, 0);

  // Check if booking is in the past
  if (bookingDateTime <= now) {
    return { valid: false, error: 'Table booking ke liye kam se kam 2 ghante pehle booking zaroori hai.' };
  }

  // Calculate time difference in minutes
  const timeDifferenceMs = bookingDateTime.getTime() - now.getTime();
  const timeDifferenceMinutes = Math.floor(timeDifferenceMs / (1000 * 60));

  // STRICT RULE: Minimum required difference = 120 minutes (exactly 2 hours)
  // If difference < 120 minutes → Reject booking
  if (timeDifferenceMinutes < 120) {
    return {
      valid: false,
      error: 'Table booking ke liye kam se kam 2 ghante pehle booking zaroori hai.',
    };
  }

  // If difference >= 120 minutes, booking is allowed
  return { valid: true };
}

/**
 * Get minimum date for booking (exactly 2 hours = 120 minutes from now)
 * 
 * RULE: Booking must be at least 120 minutes in advance
 */
export function getMinBookingDate(): string {
  const now = new Date();
  // Add exactly 120 minutes (2 hours) = 120 * 60 * 1000 milliseconds
  const twoHoursLater = new Date(now.getTime() + 120 * 60 * 1000);
  return twoHoursLater.toISOString().split('T')[0];
}

/**
 * Get minimum time for booking today (exactly 2 hours = 120 minutes from now)
 * 
 * RULE: Booking must be at least 120 minutes in advance
 */
export function getMinBookingTime(date: string): string {
  const now = new Date();
  const selectedDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

  // If booking is for today, add exactly 120 minutes (2 hours) to current time
  if (today.getTime() === selected.getTime()) {
    // Add exactly 120 minutes (2 hours) = 120 * 60 * 1000 milliseconds
    const twoHoursLater = new Date(now.getTime() + 120 * 60 * 1000);
    const hours = twoHoursLater.getHours().toString().padStart(2, '0');
    const minutes = twoHoursLater.getMinutes().toString().padStart(2, '0');
    const minTime = `${hours}:${minutes}`;
    
    // Ensure minimum time is not before booking start time
    if (minTime < BOOKING_TIME_SLOTS.startTime) {
      return BOOKING_TIME_SLOTS.startTime;
    }
    return minTime;
  }

  // For future dates, booking can start from the opening time
  return BOOKING_TIME_SLOTS.startTime;
}

/**
 * Calculate end time from start time and hours
 */
export function calculateEndTime(startTime: string, hours: number): string {
  const timeParts = startTime.split(':');
  let hoursNum = parseInt(timeParts[0], 10);
  let minutesNum = parseInt(timeParts[1], 10) || 0;

  hoursNum += hours;

  // Handle day overflow
  if (hoursNum >= 24) {
    hoursNum = 23;
    minutesNum = 59;
  }

  return `${hoursNum.toString().padStart(2, '0')}:${minutesNum.toString().padStart(2, '0')}`;
}

/**
 * Validate time slot is within allowed hours
 */
export function validateTimeSlot(time: string): { valid: boolean; error?: string } {
  const timeParts = time.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10) || 0;

  const bookingTime = hours * 60 + minutes;
  const startTimeParts = BOOKING_TIME_SLOTS.startTime.split(':');
  const endTimeParts = BOOKING_TIME_SLOTS.endTime.split(':');
  const startMinutes = parseInt(startTimeParts[0], 10) * 60 + parseInt(startTimeParts[1], 10);
  const endMinutes = parseInt(endTimeParts[0], 10) * 60 + parseInt(endTimeParts[1], 10);

  if (bookingTime < startMinutes || bookingTime > endMinutes) {
    return {
      valid: false,
      error: `Booking time must be between ${BOOKING_TIME_SLOTS.startTime} and ${BOOKING_TIME_SLOTS.endTime}`,
    };
  }

  return { valid: true };
}

