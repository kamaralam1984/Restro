# Silver Plate - Restaurant Management System

A complete, production-ready restaurant management system with Next.js frontend and Node.js backend.

## 🚀 Features

### Customer Side
- ✅ Category-wise menu with filters
- ✅ Veg/Non-Veg filter
- ✅ Add-ons & custom items
- ✅ Cart persistence (localStorage)
- ✅ Online Order + COD
- ✅ Razorpay payment integration
- ✅ Payment validation before order placement
- ✅ WhatsApp fallback order
- ✅ Table booking system
- ✅ QR Menu page
- ✅ Live language switch (Hindi/English)
- ✅ Font change per language
- ✅ SEO + Schema.org structured data

### Admin Side
- ✅ Dashboard with KPIs
- ✅ Order management
- ✅ Menu CRUD operations
- ✅ Booking management
- ✅ Analytics & Reports
- ✅ Most ordered items
- ✅ Peak hours analysis
- ✅ Revenue summary
- ✅ Repeat customers tracking

### Backend Features
- ✅ JWT Authentication
- ✅ API Rate Limiting
- ✅ Input Validation
- ✅ Environment-based secrets
- ✅ Optimized MongoDB queries
- ✅ Razorpay payment verification
- ✅ Auto WhatsApp notifications
- ✅ Slot-based booking with conflict prevention

## 📁 Project Structure

```
restaurant-system/
├── frontend/          # Next.js 14 App Router
│   ├── src/
│   │   ├── app/       # Pages & routes
│   │   ├── components/ # React components
│   │   ├── context/   # State management
│   │   ├── services/   # API services
│   │   └── utils/     # Utilities
│   └── package.json
│
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/    # Configuration
│   │   ├── models/    # MongoDB models
│   │   ├── controllers/ # Business logic
│   │   ├── routes/    # API routes
│   │   ├── middleware/ # Auth, validation, rate limiting
│   │   ├── services/   # Business services
│   │   └── utils/     # Utilities
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Razorpay SDK
- dotenv
- CORS

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-system
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_PHONE=+1234567890
WHATSAPP_API_URL=your_whatsapp_api_url
WHATSAPP_API_KEY=your_whatsapp_api_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 Development

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Start Both (from root)
```bash
npm run dev
```

## 📡 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/menu` - Get menu items
- `GET /api/menu/:id` - Get menu item
- `POST /api/orders` - Create order
- `POST /api/bookings` - Create booking
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment

### Protected Endpoints (Admin)
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/orders-per-hour` - Orders per hour
- `GET /api/analytics/top-selling` - Top selling items
- `GET /api/analytics/revenue` - Revenue summary
- `GET /api/analytics/repeat-customers` - Repeat customers

## 🗄️ Database Models

- **User** - User accounts
- **Menu** - Menu items with categories, pricing, add-ons
- **Order** - Orders with items, payment status
- **Booking** - Table bookings with slots
- **Review** - Customer reviews

## 🔒 Security Features

- JWT Authentication
- API Rate Limiting
- Input Validation
- Environment-based secrets
- CORS configuration
- MongoDB injection prevention

## 📊 Analytics

- Today's orders & revenue
- Pending orders count
- Online vs COD ratio
- Orders per hour
- Top selling items
- Revenue summary
- Repeat customers
- Booking statistics

## 🌍 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

**Backend (Render/VPS):**
1. Push to GitHub
2. Create web service on Render
3. Set environment variables
4. Deploy

**Database:**
- Use MongoDB Atlas (free tier available)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@silverplate.com or create an issue.

---

Built with ❤️ for modern restaurants
