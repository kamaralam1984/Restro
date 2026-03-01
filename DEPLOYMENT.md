# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository

### Steps

1. **Push code to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL` - Your backend API URL
     - `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay public key
     - `NEXT_PUBLIC_SITE_URL` - Your frontend URL

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live!

## Backend Deployment (VPS / Render)

### Option 1: Render

1. **Create Account**
   - Go to [render.com](https://render.com)
   - Sign up/login

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables**
   - Add all variables from `.env.production.example`
   - Set `NODE_ENV=production`

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

### Option 2: VPS (Ubuntu/Debian)

1. **SSH into your server**
```bash
ssh user@your-server-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2**
```bash
sudo npm install -g pm2
```

4. **Clone repository**
```bash
cd /var/www
git clone your-repo-url restaurant-system
cd restaurant-system/backend
```

5. **Install dependencies and build**
```bash
npm install
npm run build
```

6. **Create .env file**
```bash
nano .env
# Copy contents from .env.production.example
```

7. **Start with PM2**
```bash
pm2 start dist/server.js --name restaurant-api
pm2 save
pm2 startup
```

8. **Setup Nginx (optional)**
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## MongoDB Atlas Setup

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Database"
   - Choose free tier (M0)
   - Select region closest to your users
   - Click "Create"

3. **Database Access**
   - Go to "Database Access"
   - Add new database user
   - Set username and password
   - Save credentials securely

4. **Network Access**
   - Go to "Network Access"
   - Add IP address (0.0.0.0/0 for all, or your server IP)
   - Click "Add IP Address"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Add to `.env` as `MONGODB_URI`

## Environment Variables

### Backend (.env.production)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/restaurant-system
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
JWT_SECRET=your_secure_secret_min_32_chars
JWT_EXPIRES_IN=7d
ADMIN_PHONE=+1234567890
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Post-Deployment Checklist

- [ ] Test API endpoints
- [ ] Test payment flow
- [ ] Test booking system
- [ ] Verify WhatsApp notifications
- [ ] Check analytics dashboard
- [ ] Test admin authentication
- [ ] Verify MongoDB connection
- [ ] Check error logs
- [ ] Setup monitoring (optional)
- [ ] Setup SSL certificates
- [ ] Configure CORS properly
- [ ] Test rate limiting

## Monitoring

### PM2 Monitoring (VPS)
```bash
pm2 monit
pm2 logs
pm2 status
```

### Health Check Endpoint
```bash
curl https://api.your-domain.com/api/health
```

## Troubleshooting

### Backend not starting
- Check environment variables
- Verify MongoDB connection
- Check port availability
- Review error logs

### Frontend build fails
- Check environment variables
- Verify API URL is correct
- Check for TypeScript errors
- Review build logs

### Payment not working
- Verify Razorpay keys
- Check webhook configuration
- Review payment logs
- Test with test keys first

