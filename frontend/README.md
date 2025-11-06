# Commerce Pro - E-Commerce Platform Frontend

A modern, full-featured e-commerce platform frontend built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Customer Features
- **Product Browsing**: Browse products with filtering, sorting, and search
- **Product Details**: Detailed product pages with image galleries and reviews
- **Shopping Cart**: Add/remove items, update quantities, view totals
- **Wishlist**: Save favorite products for later
- **Checkout**: Secure checkout with Stripe payment integration
- **Order Management**: View order history and track order status
- **User Profile**: Manage account information and change password

### Admin Features
- **Dashboard**: Overview of sales, orders, products, and users with analytics
- **Product Management**: Create, read, update, and delete products
- **Order Management**: View and update order statuses
- **User Management**: Manage user accounts and roles

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form validation
- **Axios** - HTTP client
- **Stripe Elements** - Payment processing
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable components
│   ├── common/      # Common UI components (Button, Input, Card, etc.)
│   └── product/     # Product-specific components
├── layouts/         # Layout components
│   ├── MainLayout.tsx    # Main app layout with header/footer
│   └── AuthLayout.tsx    # Authentication pages layout
├── pages/           # Page components
│   ├── admin/       # Admin pages (Dashboard, Products, Orders, Users)
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   ├── OrderDetail.tsx
│   ├── Wishlist.tsx
│   ├── Profile.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── NotFound.tsx
├── services/        # API services
│   ├── api.ts       # Axios instance with interceptors
│   └── auth.service.ts  # Authentication service
├── store/           # Zustand stores
│   ├── authStore.ts     # Authentication state
│   ├── cartStore.ts     # Shopping cart state
│   └── wishlistStore.ts # Wishlist state
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main app component with routing
└── main.tsx         # Application entry point
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🔐 Authentication

The app uses JWT-based authentication with the following flow:

1. User logs in with email/password
2. Backend returns JWT token and user data
3. Token is stored in localStorage and Zustand store
4. Token is automatically included in API requests via Axios interceptor
5. Protected routes check authentication status before rendering

### Protected Routes

- `/checkout` - Checkout page
- `/orders` - Order history
- `/orders/:id` - Order details
- `/wishlist` - Wishlist
- `/profile` - User profile

### Admin Routes

- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management

Admin routes require `role: 'admin'` in user data.

## 🛒 State Management

### Auth Store (`authStore.ts`)
- User authentication state
- Login/logout functionality
- Profile updates
- Persistent storage

### Cart Store (`cartStore.ts`)
- Shopping cart items
- Add/remove/update items
- Calculate totals
- Persistent storage

### Wishlist Store (`wishlistStore.ts`)
- Wishlist items
- Add/remove items
- Persistent storage

## 💳 Payment Integration

The checkout process uses Stripe Elements for secure payment processing:

1. User enters shipping information
2. Stripe Elements loads payment form
3. User enters card details (handled securely by Stripe)
4. Payment is processed via backend
5. Order is created and user is redirected to success page

## 🎨 Styling

The project uses Tailwind CSS with a custom configuration:

- **Primary Color**: Blue (#3b82f6)
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Not implemented (can be added)
- **Custom Components**: Reusable styled components in `components/common/`

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 API Integration

All API calls go through the centralized `api.ts` service:

```typescript
// Example API call
import apiService from './services/api';

const products = await apiService.get('/products');
```

The API service includes:
- Automatic token injection
- Error handling
- Request/response interceptors
- Type-safe responses

## 🧪 Testing

Testing setup (to be implemented):
```bash
npm run test        # Run tests
npm run test:watch  # Watch mode
npm run test:coverage  # Coverage report
```

## 📦 Building for Production

1. Update environment variables for production
2. Build the project:
```bash
npm run build
```
3. Deploy the `dist/` folder to your hosting service

### Deployment Options

- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Drag and drop `dist/` folder or connect repo
- **AWS S3 + CloudFront**: Upload to S3 and configure CloudFront
- **Docker**: Use provided Dockerfile (to be created)

## 🔒 Security

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- HTTPS required in production
- Input validation on all forms
- XSS protection via React's built-in escaping
- CSRF protection via backend

## 🐛 Common Issues

### CORS Errors
Ensure backend CORS is configured to allow frontend origin:
```javascript
// Backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Stripe Not Loading
Check that `VITE_STRIPE_PUBLIC_KEY` is set correctly in `.env`

### API Connection Failed
Verify `VITE_API_URL` points to running backend server

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Stripe for payment processing
- All open-source contributors
