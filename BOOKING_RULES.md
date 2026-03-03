# Restro OS Restaurant - Table Booking System Rules

## 📋 Table Booking Rules

### 1. Advance Booking Rule (STRICT)
- **Minimum Advance Booking**: Table booking के लिए कम से कम **2 घंटे पहले** booking करना जरूरी है
- **Calculation**: Time difference की गणना minutes में की जाती है
- **Minimum Required Difference**: Exactly **120 minutes (2 hours)**
- **Allowed**: Exactly 2 hours (120 minutes) का difference ALLOWED है
- **Not Allowed**: 119 minutes या उससे कम का difference NOT ALLOWED है
- **Server Time**: Validation server time के अनुसार होती है (device time नहीं)
- **Error Message**: "Table booking ke liye kam se kam 2 ghante pehle booking zaroori hai."

#### Examples:
- **Booking Time: 12:00 PM**
  - ✅ Allowed: 10:00 AM या उससे पहले book करें (≥120 min difference)
  - ❌ Not Allowed: 9:59 AM या 10:00 AM के बाद किसी भी समय (<120 min)

- **Booking Time: 8:00 PM**
  - ✅ Allowed: 6:00 PM या उससे पहले book करें (≥120 min difference)
  - ❌ Not Allowed: 6:01 PM, 7:00 PM, 7:59 PM (<120 min)

- **Same Day Booking within 2 Hours**: अगर 2 घंटे के अंदर booking करनी है तो call करके booking करवानी होगी

### 2. Booking Time Slots
- **Available Hours**: 11:00 AM से 11:00 PM तक (11:00 - 23:00)
- **Booking Duration**: Minimum 1 hour, Maximum 12 hours
- **Time Format**: 24-hour format (HH:MM)

### 3. Table Pricing Rules (Hourly Rates)

#### Hourly Rates Based on Table Capacity:
- **6 Person Table (6+ capacity)**: ₹600 per hour
- **4 Person Table (4 capacity)**: ₹400 per hour
- **2 Person Table (2 capacity)**: ₹200 per hour

#### Total Booking Amount Calculation:
- **Formula**: Hourly Rate × Number of Hours
- **Example**: 6 person table for 3 hours = ₹600 × 3 = ₹1,800

#### Advance Payment:
- Advance payment = 1 hour की rate (first hour)
- Total booking amount = Hourly rate × Booking hours
- Payment required to confirm booking

### 4. Discount Rules

#### Discount Eligibility:
- **Condition**: Order total discount threshold तक पहुंचना चाहिए
- **Discount Thresholds**:
  - 6 Person Table: ₹1,500
  - 4 Person Table: ₹1,000
  - 2 Person Table: ₹500

#### Discount Amount:
- **Important Rule**: केवल **1 hour का discount** apply होता है
- **Discount Value**: 1 hour की booking rate के बराबर
  - 6 Person Table: ₹600 discount
  - 4 Person Table: ₹400 discount
  - 2 Person Table: ₹200 discount

#### Discount Application:
- जब customer order करता है और order total discount threshold तक पहुंच जाता है
- तब order पर discount apply होगा (1 hour booking rate के बराबर)
- Discount booking amount पर नहीं, order amount पर apply होता है

### 5. Payment Rules

#### Payment Methods:
- **Online Payment Only**: Table booking के लिए online payment जरूरी है
- **Payment Gateway**: Razorpay
- **Payment Status**: 
  - Pending: Payment नहीं हुआ
  - Paid: Payment successful
  - Failed: Payment failed

#### Payment Amount:
- **Total Booking Amount**: Hourly rate × Booking hours
- **Payment Required**: Full booking amount advance में pay करना होगा

#### Payment Policy:
- **Non-Refundable**: Payment non-refundable है
- **Confirmation**: Payment successful होने के बाद ही booking confirm होती है
- **Email Receipt**: Payment के बाद customer को email में advance booking bill/receipt send होता है

### 6. Table Selection Rules

#### Table Availability:
- **Capacity Check**: Table की capacity, guests की संख्या से कम नहीं होनी चाहिए
- **Time Slot Overlap**: Same time slot में table already booked हो तो select नहीं कर सकते
- **Status Check**: 
  - Available: Green (select कर सकते हैं)
  - Booked: Red (select नहीं कर सकते)
  - Too Small: Yellow (capacity कम है)

#### Table Reservation:
- Table selected time से end time तक reserved रहेगी
- Reservation duration = Booking hours

### 7. Booking Information Rules

#### Required Information:
- Customer Name (Required)
- Customer Email (Required)
- Customer Phone (Required)
- Booking Date (Required)
- Booking Time (Required)
- Booking Hours (Required, 1-12 hours)
- Number of Guests (Required, 1-20)
- Table Selection (Required)
- Special Requests (Optional)

#### Booking Number:
- Auto-generated unique booking number
- Format: `BK-{timestamp}-{count}`

### 8. Email Notification Rules

#### Automatic Email:
- **When**: Payment verify होने के बाद automatically send होता है
- **To**: Customer की email ID
- **Subject**: "Table Booking Confirmed - {Booking Number}"

#### Email Content Includes:
- Booking Number
- Customer Details (Name, Email, Phone)
- Booking Date & Time
- End Time
- Duration (Hours)
- Table Number & Capacity
- Number of Guests
- Special Requests (if any)
- **Advance Booking Payment Amount**
- Payment Status (PAID)
- Discount Information
- Important Notes

#### Email Failure:
- Email send नहीं होने पर booking process fail नहीं होगा
- Payment successful होने पर booking confirm रहेगी

### 9. Booking Status Rules

#### Status Types:
- **Pending**: Booking created, payment pending
- **Confirmed**: Payment successful, booking confirmed
- **Cancelled**: Booking cancelled
- **Completed**: Booking completed

#### Status Flow:
1. Booking Created → Status: **Pending**, Payment: **Pending**
2. Payment Successful → Status: **Confirmed**, Payment: **Paid**
3. Email Sent → Customer को confirmation email
4. Booking Completed → Status: **Completed**

### 10. Booking Modification Rules

#### Time Slot Conflict:
- Same date और time पर overlapping bookings allow नहीं हैं
- Time slot overlap check automatically होता है
- Conflict होने पर error message show होता है

#### Booking Cancellation:
- Cancelled bookings को modify नहीं किया जा सकता
- Payment non-refundable है

### 11. Special Rules

#### Multiple Days Booking:
- कोई upper time limit नहीं है
- कितने भी दिन पहले booking कर सकते हैं
- Minimum 2 hours advance booking rule हमेशा apply होगी

#### Same Day Booking:
- Same day booking के लिए minimum 2 hours advance booking जरूरी है
- 2 hours के अंदर booking के लिए call करना होगा

#### Guest Capacity:
- Minimum: 1 guest
- Maximum: 20 guests
- Table capacity से ज्यादा guests allow नहीं हैं

### 12. System Validation Rules

#### Frontend Validation:
- Client-side validation for better UX
- Real-time validation errors
- Time slot validation
- Advance booking validation

#### Backend Validation:
- **Authoritative**: Backend validation final है
- Server time based validation
- Strict 120 minutes rule enforcement
- All validations server-side verify होती हैं

### 13. Error Handling Rules

#### Validation Errors:
- Clear error messages in Hindi/English
- Time slot errors
- Advance booking errors
- Capacity errors
- Payment errors

#### Email Errors:
- Email failure से booking process affect नहीं होता
- Payment successful होने पर booking confirm रहती है

---

## 📝 Summary

### Key Rules:
1. ✅ **2 Hours Advance Booking** (STRICT - 120 minutes minimum)
2. ✅ **Hourly Pricing** (₹600/₹400/₹200 based on table capacity)
3. ✅ **1 Hour Discount Only** (when order reaches threshold)
4. ✅ **Online Payment Only** (Non-refundable)
5. ✅ **Email Confirmation** (with advance booking bill)
6. ✅ **Time Slots** (11:00 AM - 11:00 PM)
7. ✅ **Server Time Validation** (not device time)

### Important Notes:
- सभी rules strictly enforce होती हैं
- कोई exception नहीं है
- Server-side validation final है
- Payment non-refundable है
- Email automatically send होता है

---

**Last Updated**: 2025
**Version**: 1.0

