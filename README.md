# Digital Games & Gift Cards Marketplace

## Description
A comprehensive marketplace for digital games, gift cards, and DLCs similar to Driffle.com.

## Features

### User Features
- 🎮 Digital games marketplace
- 🎁 Gift cards for major platforms (Steam, Xbox, PlayStation, Nintendo)
- 📦 DLC content
- 💰 Competitive pricing with discounts
- ⭐ Premium subscription (Driffle Plus)
- 📧 Newsletter subscription
- 🛒 Shopping cart and checkout

### Admin Features
- 📊 Dashboard with KPIs
- 📦 Product management (CRUD)
- 🏷️ Promotion and discount management
- 👥 User and subscription management
- 📋 Order fulfillment system
- 📈 Analytics and reporting
- 🔧 Site configuration

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Redis for caching
- JWT authentication
- Stripe for payments
- Nodemailer for emails

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Redux for state management
- React Router for navigation

### Security
- Helmet for security headers
- Rate limiting
- Input validation
- BCrypt for password hashing

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm run install-deps
```

3. Create a `.env` file in the root directory with:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
REDIS_URL=redis://localhost:6379
```

4. Run the development servers:
```bash
npm run dev
```

## Project Structure
```
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
└── package.json
```

## API Documentation
Available at `/api-docs` when running the server.

## License
MIT