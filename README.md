# MARKET — Frontend

A modern e-commerce storefront built with React, featuring product browsing, cart management, authentication, and Stripe payments.

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Axios** — HTTP requests
- **Stripe.js + React Stripe** — Payment processing
- **Context API** — Global state (Auth + Cart)
- **CSS Variables** — Dark editorial design system

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Top navigation with cart badge and user menu
│   ├── Footer.js          # Site footer with links
│   └── ProductCard.js     # Reusable product card with add-to-cart
├── context/
│   ├── AuthContext.js     # User auth state, login/logout/register
│   └── CartContext.js     # Cart state, persisted to localStorage
├── pages/
│   ├── Home.js            # Hero, featured products, CTA banner
│   ├── Products.js        # Product grid with search, filter, sort, pagination
│   ├── ProductDetail.js   # Single product page with reviews
│   ├── Cart.js            # Cart with quantity controls and order summary
│   ├── Checkout.js        # Stripe card payment + shipping address form
│   ├── OrderSuccess.js    # Post-payment confirmation page
│   ├── Orders.js          # User order history
│   ├── Login.js           # Login form
│   ├── Register.js        # Registration form
│   └── AdminDashboard.js  # Admin panel (products + orders management)
├── services/
│   ├── api.js             # Axios instance + all API calls
│   └── adminApi.js        # Admin-specific API calls
├── App.js                 # Routes and providers
├── index.css              # Global styles and design system
└── admin.css              # Admin dashboard styles
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend server running (see backend README)
- Stripe account (free test keys)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```dotenv
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
```

### Run Locally

```bash
npm start
```

App runs at **http://localhost:3000**

### Build for Production

```bash
npm run build
```

---

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add environment variables:
   - `REACT_APP_API_URL` = your Render backend URL + `/api`
   - `REACT_APP_STRIPE_PUBLIC_KEY` = your Stripe publishable key
4. Click **Deploy**

---

## 🔑 Test Accounts

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| User  | test@shop.com   | test1234  |
| Admin | admin@shop.com  | admin123  |

---

## 💳 Test Stripe Payments

| Card Number          | Result            |
|----------------------|-------------------|
| 4242 4242 4242 4242  | Payment succeeds  |
| 4000 0000 0000 9995  | Payment declined  |

Use any future expiry date and any 3-digit CVC.

---

## ✨ Features

### Customer
- Browse products with search, category filter, and sort
- View product detail pages with reviews and ratings
- Add to cart with quantity controls
- Cart persists across browser sessions
- Register and login with JWT authentication
- Checkout with Stripe card payments
- Free shipping on orders over $75
- View order history and status

### Admin (login as admin@shop.com)
- Overview dashboard with revenue, order, and product stats
- Create, edit, and delete products
- View and manage all customer orders
- Update order status and add tracking numbers
- Access at `/admin` or via the navbar dropdown

---

## 🗺 Pages & Routes

| Route              | Page            | Auth Required |
|--------------------|-----------------|---------------|
| `/`                | Home            | No            |
| `/products`        | Product Listing | No            |
| `/products/:id`    | Product Detail  | No            |
| `/cart`            | Cart            | No            |
| `/login`           | Login           | No            |
| `/register`        | Register        | No            |
| `/checkout`        | Checkout        | Yes           |
| `/order-success/:id` | Order Success | Yes           |
| `/orders`          | Order History   | Yes           |
| `/admin`           | Admin Dashboard | Admin only    |