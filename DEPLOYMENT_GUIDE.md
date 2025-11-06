# Commerce-Pro Deployment Guide

This guide covers deploying the Commerce-Pro e-commerce platform to production using Railway (backend) and Vercel (frontend).

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Stripe Production Setup](#stripe-production-setup)
6. [Email Service Setup](#email-service-setup)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] API endpoints tested
- [ ] Payment flow tested with Stripe test cards
- [ ] Email templates verified
- [ ] Security headers configured
- [ ] CORS settings reviewed
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Git repository clean and up-to-date

## Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email

### 2. Create a Cluster

1. Click "Build a Database"
2. Choose deployment option:
   - **Shared** (M0 Free tier for testing)
   - **Dedicated** (M10+ for production)
3. Select cloud provider and region (choose closest to your users)
4. Name your cluster (e.g., "commerce-pro-prod")
5. Click "Create Cluster"

### 3. Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose authentication method: **Password**
4. Create username and strong password
5. Set user privileges: **Read and write to any database**
6. Click "Add User"

**Important:** Save these credentials securely!

### 4. Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For production:
   - Add your Railway backend IP
   - Or use `0.0.0.0/0` (allow from anywhere) - less secure but easier
4. Click "Confirm"

### 5. Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., "commerce-pro")

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/commerce-pro?retryWrites=true&w=majority
```

### 6. Create Database and Collections

MongoDB will automatically create collections when you insert data, but you can pre-create them:

1. Click "Browse Collections"
2. Click "Add My Own Data"
3. Create database: `commerce-pro`
4. Create collections:
   - users
   - products
   - orders
   - carts
   - reviews

## Backend Deployment (Railway)

### 1. Create Railway Account

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your Commerce-Pro repository
4. Railway will detect it's a Node.js project

### 3. Configure Build Settings

Railway should auto-detect the build settings, but verify:

1. Go to project settings
2. Check "Build Command": `npm install`
3. Check "Start Command": `npm start`
4. Set "Root Directory": `/Full-Stack/Commerce-Store` (if needed)

### 4. Configure Environment Variables

1. Go to "Variables" tab
2. Add all environment variables:

```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/commerce-pro

# JWT
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6. Deploy

1. Click "Deploy"
2. Railway will build and deploy your backend
3. Wait for deployment to complete
4. Note your backend URL (e.g., `https://your-app.railway.app`)

### 7. Verify Deployment

Test your backend:
```bash
curl https://your-app.railway.app/api/v1/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running"
}
```

## Frontend Deployment (Vercel)

### 1. Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 2. Import Project

1. Click "Add New Project"
2. Import your Commerce-Pro repository
3. Vercel will detect it's a Vite project

### 3. Configure Build Settings

1. Set "Framework Preset": **Vite**
2. Set "Root Directory": `Full-Stack/Commerce-Store/frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Install Command: `npm install`

### 4. Configure Environment Variables

1. Go to "Environment Variables"
2. Add variables:

```env
VITE_API_URL=https://your-app.railway.app/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

### 5. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Wait for deployment to complete
4. Note your frontend URL (e.g., `https://your-app.vercel.app`)

### 6. Configure Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (can take up to 48 hours)

### 7. Update Backend CORS

Update `FRONTEND_URL` in Railway environment variables:
```env
FRONTEND_URL=https://your-app.vercel.app
```

Or if using custom domain:
```env
FRONTEND_URL=https://yourdomain.com
```

## Stripe Production Setup

### 1. Activate Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete account activation:
   - Business information
   - Bank account details
   - Identity verification

### 2. Get Production API Keys

1. Toggle from "Test mode" to "Live mode"
2. Go to Developers → API keys
3. Copy your **Live** keys:
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`)

### 3. Update Environment Variables

Update in Railway:
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
```

Update in Vercel:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

### 4. Configure Webhook Endpoint

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter endpoint URL:
   ```
   https://your-app.railway.app/api/v1/payment/webhook
   ```
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update Railway environment variable:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### 5. Test Production Webhook

1. Go to your webhook endpoint in Stripe Dashboard
2. Click "Send test webhook"
3. Select `payment_intent.succeeded`
4. Check Railway logs to verify webhook received

## Email Service Setup

### Option 1: SendGrid (Recommended)

#### 1. Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com)
2. Sign up for free account (100 emails/day)
3. Verify your email

#### 2. Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "Commerce-Pro Production"
4. Permissions: "Full Access"
5. Click "Create & View"
6. Copy the API key (shown only once!)

#### 3. Verify Sender Identity

1. Go to Settings → Sender Authentication
2. Choose "Single Sender Verification"
3. Enter your email address
4. Verify the email

#### 4. Update Environment Variables

Update in Railway:
```env
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### Option 2: AWS SES

1. Create AWS account
2. Verify email addresses or domain
3. Request production access (remove sandbox limits)
4. Get SMTP credentials
5. Update environment variables

### Option 3: Custom SMTP Server

If you have your own SMTP server:
```env
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

## Post-Deployment Configuration

### 1. Update CORS Settings

Ensure backend allows requests from frontend:

In Railway environment variables:
```env
FRONTEND_URL=https://your-app.vercel.app
```

### 2. Test All Features

#### Authentication
- Register new user
- Login
- Password reset
- Email verification

#### Products
- Browse products
- Search products
- View product details
- Filter by category

#### Shopping
- Add to cart
- Update quantities
- Remove from cart
- Add to wishlist

#### Checkout
- Enter shipping address
- Complete payment with real card
- Verify order creation
- Check confirmation email

#### Admin
- Login as admin
- Create product
- Update order status
- Process refund

### 3. Monitor Initial Traffic

1. Check Railway logs for errors
2. Monitor Stripe Dashboard for payments
3. Check email delivery rates
4. Monitor database performance

### 4. Set Up Error Tracking

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for user analytics

### 5. Configure Backups

#### MongoDB Atlas Backups
1. Go to "Backup" in Atlas
2. Enable "Continuous Backup" (paid feature)
3. Or use "Cloud Backup" (free tier)
4. Set backup schedule

#### Railway Backups
Railway doesn't provide automatic backups, so:
1. Set up periodic database exports
2. Store backups in cloud storage (S3, Google Cloud Storage)

## Monitoring & Maintenance

### 1. Set Up Monitoring

#### Railway Monitoring
1. Go to "Metrics" tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Network traffic
   - Response times

#### MongoDB Atlas Monitoring
1. Go to "Metrics" tab
2. Monitor:
   - Database operations
   - Connection count
   - Storage usage
   - Query performance

#### Stripe Monitoring
1. Check Stripe Dashboard daily
2. Monitor:
   - Payment success rate
   - Failed payments
   - Refund requests
   - Dispute rate

### 2. Set Up Alerts

#### Railway Alerts
1. Go to "Settings" → "Notifications"
2. Enable alerts for:
   - Deployment failures
   - High CPU usage
   - High memory usage

#### MongoDB Atlas Alerts
1. Go to "Alerts"
2. Set up alerts for:
   - High connection count
   - Low storage space
   - Slow queries

#### Stripe Alerts
1. Go to "Developers" → "Webhooks"
2. Enable email notifications for:
   - Failed payments
   - Disputes
   - Refunds

### 3. Regular Maintenance Tasks

#### Daily
- Check error logs
- Monitor payment success rate
- Review failed transactions

#### Weekly
- Review database performance
- Check email delivery rates
- Update dependencies (if needed)
- Review user feedback

#### Monthly
- Database optimization
- Security audit
- Performance review
- Cost analysis

### 4. Scaling Considerations

#### When to Scale

Scale when you experience:
- High response times (>500ms)
- High CPU usage (>80%)
- High memory usage (>80%)
- Database connection limits reached

#### Scaling Options

**Railway:**
- Upgrade to higher tier plan
- Enable auto-scaling
- Add more instances

**MongoDB Atlas:**
- Upgrade cluster tier (M10, M20, M30, etc.)
- Enable auto-scaling
- Add read replicas

**Vercel:**
- Automatically scales
- Upgrade plan for more bandwidth

## Troubleshooting

### Common Issues

#### 1. Deployment Failed

**Railway:**
```bash
# Check build logs
railway logs

# Common fixes:
- Verify package.json scripts
- Check Node.js version
- Ensure all dependencies installed
```

**Vercel:**
```bash
# Check deployment logs in Vercel dashboard
# Common fixes:
- Verify build command
- Check environment variables
- Ensure correct root directory
```

#### 2. Database Connection Error

**Error:** `MongooseServerSelectionError`

**Solutions:**
- Verify MongoDB URI is correct
- Check IP whitelist in Atlas
- Verify database user credentials
- Check network connectivity

#### 3. CORS Error in Production

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
- Verify `FRONTEND_URL` in Railway
- Check CORS configuration in backend
- Ensure frontend URL is correct
- Clear browser cache

#### 4. Stripe Webhook Not Working

**Error:** `Webhook signature verification failed`

**Solutions:**
- Verify webhook secret is correct
- Check webhook endpoint URL
- Ensure endpoint is publicly accessible
- Test with Stripe CLI

#### 5. Email Not Sending

**Error:** `Error sending email`

**Solutions:**
- Verify SMTP credentials
- Check SendGrid API key
- Verify sender email is verified
- Check email service logs

#### 6. High Response Times

**Solutions:**
- Enable database indexes
- Implement caching (Redis)
- Optimize database queries
- Scale up server resources

### Debug Production Issues

#### View Railway Logs
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs
```

#### View Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments"
4. Click on deployment
5. View "Build Logs" or "Function Logs"

#### View MongoDB Logs
1. Go to Atlas Dashboard
2. Select your cluster
3. Go to "Metrics"
4. View "Operations" and "Connections"

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique secrets
- Rotate secrets regularly
- Use different secrets for dev/prod

### 2. Database Security
- Use strong passwords
- Limit IP access
- Enable encryption at rest
- Regular backups

### 3. API Security
- Enable rate limiting
- Use HTTPS only
- Implement CSRF protection
- Validate all inputs

### 4. Payment Security
- Use Stripe's PCI-compliant solution
- Never store card details
- Verify webhook signatures
- Monitor for fraud

### 5. Regular Updates
- Update dependencies monthly
- Apply security patches immediately
- Review security advisories
- Conduct security audits

## Performance Optimization

### 1. Database Optimization
- Create indexes on frequently queried fields
- Use lean queries
- Implement pagination
- Cache frequently accessed data

### 2. API Optimization
- Enable compression
- Implement response caching
- Use CDN for static assets
- Optimize image sizes

### 3. Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle size reduction

## Cost Optimization

### Current Costs (Estimated)

**Free Tier:**
- Railway: $5/month (500 hours)
- Vercel: Free (hobby plan)
- MongoDB Atlas: Free (M0 cluster)
- SendGrid: Free (100 emails/day)

**Production Tier:**
- Railway: $20-50/month
- Vercel: $20/month (Pro plan)
- MongoDB Atlas: $57/month (M10 cluster)
- SendGrid: $15/month (40k emails)

**Total:** ~$112-142/month

### Cost Reduction Tips
1. Use free tiers for development
2. Optimize database queries
3. Implement caching
4. Use CDN for static assets
5. Monitor and optimize resource usage

## Rollback Procedure

If deployment fails or causes issues:

### Railway Rollback
1. Go to "Deployments"
2. Find previous working deployment
3. Click "Redeploy"

### Vercel Rollback
1. Go to "Deployments"
2. Find previous working deployment
3. Click "Promote to Production"

### Database Rollback
1. Restore from backup
2. Or manually revert changes

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Stripe Docs**: https://stripe.com/docs

## Conclusion

Your Commerce-Pro application is now deployed to production! Monitor the application closely in the first few days and be ready to address any issues that arise.

Remember to:
- Monitor logs regularly
- Keep dependencies updated
- Backup database regularly
- Review security settings
- Optimize performance
- Scale as needed

Good luck with your e-commerce platform! 🚀