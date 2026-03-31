# VSEnterprises Admin Panel

**A Freelance Project by BRX Labz Agency**

---

## 📋 Project Overview

VSEnterprises Admin Panel is a modern, full-stack admin dashboard built with Next.js 16 and React 19. This application serves as a comprehensive management system for VS Enterprises, enabling administrators to efficiently manage products, orders, categories, blogs, and testimonials. The project features authentication powered by Clerk, MongoDB database integration, and a beautiful, responsive UI built with Tailwind CSS v4.

### Key Features

- 🔐 **Authentication & Authorization** - Secure login/signup with Clerk
- 🛍️ **Product Management** - Full CRUD operations with variant support
- 📦 **Order Management** - Track orders, payment status, and generate invoices
- 🏷️ **Category Management** - Organize products into categories
- 📝 **Blog Management** - Create and manage blog posts
- ⭐ **Testimonials** - Manage customer testimonials
- 📊 **Dashboard** - Clean overview of business metrics
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ☁️ **Cloud Database** - MongoDB Atlas integration
- 🎨 **Modern UI/UX** - Built with Tailwind CSS v4 and Framer Motion animations

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16.2.1 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion 12.38.0
- **Icons**: Lucide React 0.577.0
- **Utilities**: clsx, tailwind-merge
- **Fonts**: Geist Sans & Geist Mono

### Backend
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 9.3.1
- **API Routes**: Next.js API Routes

### Authentication
- **Provider**: Clerk (@clerk/nextjs 7.0.6)

### Development Tools
- **Linting**: ESLint 9.x
- **Build Tool**: Next.js Compiler
- **React Compiler**: babel-plugin-react-compiler

---

## 📁 Project Structure

```
vsadmin/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Authentication pages
│   │   │   ├── sign-in/          # Sign-in page
│   │   │   └── sign-up/          # Sign-up page
│   │   ├── (dashboard)/          # Dashboard pages (protected)
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── products/         # Products management
│   │   │   ├── orders/           # Orders management
│   │   │   ├── categories/       # Categories management
│   │   │   ├── blogs/            # Blog management
│   │   │   └── testimonials/     # Testimonials management
│   │   ├── api/                  # API routes
│   │   │   ├── products/         # Product CRUD endpoints
│   │   │   ├── orders/           # Order CRUD endpoints
│   │   │   ├── categories/       # Category CRUD endpoints
│   │   │   ├── blogs/            # Blog CRUD endpoints
│   │   │   ├── testimonials/     # Testimonial CRUD endpoints
│   │   │   ├── upload/           # File upload endpoint
│   │   │   └── db_debug/         # Database debugging endpoint
│   │   ├── layout.tsx            # Root layout with Clerk provider
│   │   └── globals.css           # Global styles
│   ├── components/               # Reusable React components
│   │   ├── products/             # Product-related components
│   │   ├── orders/               # Order-related components
│   │   ├── categories/           # Category-related components
│   │   ├── blogs/                # Blog-related components
│   │   ├── testimonials/         # Testimonial-related components
│   │   ├── Sidebar.tsx           # Dashboard sidebar navigation
│   │   ├── MobileSidebar.tsx     # Mobile sidebar component
│   │   └── Navbar.tsx            # Top navigation bar
│   ├── models/                   # Mongoose database models
│   │   ├── Product.ts            # Product schema with variants
│   │   ├── Order.ts              # Order schema
│   │   ├── Category.ts           # Category schema
│   │   ├── Blog.ts               # Blog schema
│   │   ├── Testimonial.ts        # Testimonial schema
│   │   └── User.ts               # User schema
│   ├── lib/                      # Utility libraries
│   │   └── mongoose.ts           # MongoDB connection helper
│   └── proxy.ts                  # Proxy configuration
├── public/                       # Static assets
│   └── uploads/                  # Uploaded files
├── .env.local                    # Environment variables
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.17 or later (recommended: Node.js 20+)
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB instance)
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vsadmin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
   CLERK_SECRET_KEY=sk_test_your_key
   MONGODB_URI=mongodb://your_connection_string
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Models

### Product Model
The Product model supports both simple and variant products:

**Core Fields:**
- `name` - Product name (required)
- `description` - Product description
- `images` - Array of image URLs
- `price` - Base price
- `unit` - Unit of measurement (piece, kg, etc.)
- `categoryId` - Reference to Category
- `inStock`, `onSale`, `bestSeller`, `newArrival` - Status flags
- `rating` - Product rating

**Variant Support:**
- `isVariantProduct` - Boolean flag for variant products
- `variantOptions` - Available options (diameters, lengths, materials, sizes)
- `pricingData` - Pricing matrix based on variant combinations

### Order Model
- `gstno` - GST number
- `invoicePdf` - Invoice PDF URL
- `invoiceData` - Invoice binary data
- `status` - Order status
- `paymentStatus` - Payment status
- `transactionId` - Transaction reference
- Additional fields stored flexibly (strict: false)

### Category Model
Simple categorization for products with hierarchical support.

### Blog Model
Flexible schema for blog posts with custom fields support.

### Testimonial Model
Customer testimonials with rating and verification fields.

---

## 🔌 API Endpoints

All API routes follow RESTful conventions:

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order by ID
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Delete order
- `GET /api/orders/[id]/invoice` - Generate invoice

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/[id]` - Get category by ID
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Blogs
- `GET /api/blogs` - List all blogs
- `POST /api/blogs` - Create new blog
- `GET /api/blogs/[id]` - Get blog by ID
- `PUT /api/blogs/[id]` - Update blog
- `DELETE /api/blogs/[id]` - Delete blog

### Testimonials
- `GET /api/testimonials` - List all testimonials
- `POST /api/testimonials` - Create new testimonial
- `GET /api/testimonials/[id]` - Get testimonial by ID
- `PUT /api/testimonials/[id]` - Update testimonial
- `DELETE /api/testimonials/[id]` - Delete testimonial

### Upload
- `POST /api/upload` - Upload files (images, documents)

---

## 🎨 UI Components

### Layout Components
- **Sidebar** - Main navigation with links to all modules
- **MobileSidebar** - Responsive mobile navigation
- **Navbar** - Top bar with user menu and notifications

### Feature Components
Each module has dedicated components:
- **ProductRow** / **AddProduct** - Product listing and creation
- **OrderRow** - Order display and management
- **CategoryCard** / **AddCategory** - Category visualization
- **BlogRow** / **CreateBlog** - Blog management
- **TestimonialRow** / **CreateTestimonial** - Testimonial handling

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build production bundle
npm start        # Start production server
npm run lint     # Run ESLint
```

### Building for Production

```bash
npm run build
npm start
```

The build process creates an optimized production bundle in the `.next` directory.

### Code Style

The project uses ESLint with Next.js recommended rules. Run linting before committing:

```bash
npm run lint
```

---

## 🔐 Authentication

The app uses Clerk for authentication. Key features:

- **Protected Routes**: All dashboard pages require authentication
- **Sign In/Up Pages**: Custom Clerk-hosted pages at `/sign-in` and `/sign-up`
- **User Management**: Clerk dashboard for managing users
- **Session Handling**: Automatic session management via Clerk middleware

### Setting up Clerk

1. Create account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy publishable and secret keys to `.env.local`
4. Configure sign-in/sign-up URLs in Clerk dashboard

---

## 🗄️ Database Setup

### MongoDB Atlas Configuration

1. Create MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user with read/write permissions
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string and update `MONGODB_URI` in `.env.local`

### Connection String Format
```
mongodb://username:password@cluster-url:27017/database-name?ssl=true&replicaSet=atlas-xxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

---

## 📱 Responsive Design

The application is fully responsive and works across:
- **Desktop** (1024px+) - Full sidebar + expanded layout
- **Tablet** (768px - 1023px) - Collapsible sidebar
- **Mobile** (< 768px) - Hamburger menu + mobile sidebar

Tailwind CSS breakpoints ensure consistent experience across devices.

---

## 🚧 Deployment

### Recommended Platforms

**Vercel** (Recommended)
```bash
vercel deploy
```

**Netlify**
```bash
npm run build
netlify deploy
```

**Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next .next
COPY public public
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables in Production

Ensure all environment variables are set in your hosting platform:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

---

## 🧪 Testing

While not included in the initial setup, recommended testing stack:
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **API Tests**: Supertest

Example test structure:
```
tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── flows/
```

---

## 📦 Dependencies

### Production Dependencies
- `@clerk/nextjs`: ^7.0.6 - Authentication
- `clsx`: ^2.1.1 - Conditional class names
- `framer-motion`: ^12.38.0 - Animations
- `lucide-react`: ^0.577.0 - Icon library
- `mongoose`: ^9.3.1 - MongoDB ODM
- `next`: 16.2.1 - React framework
- `react`: 19.2.4 - UI library
- `react-dom`: 19.2.4 - React DOM renderer
- `tailwind-merge`: ^3.5.0 - Tailwind class merging

### Development Dependencies
- `@tailwindcss/postcss`: ^4 - PostCSS plugin for Tailwind
- `@types/node`: ^20 - Node.js types
- `@types/react`: ^19 - React types
- `@types/react-dom`: ^19 - React DOM types
- `babel-plugin-react-compiler`: 1.0.0 - React compiler
- `eslint`: ^9 - Linting
- `eslint-config-next`: 16.2.1 - ESLint config for Next.js
- `tailwindcss`: ^4 - Utility-first CSS framework
- `typescript`: ^5 - Type safety

---

## 🤝 Contributing

This is a freelance project developed by **BRX Labz Agency**. For contributions or modifications:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software developed for VS Enterprises by BRX Labz Agency. All rights reserved.

---

## 👨‍💻 Development Team

**Developed by:** BRX Labz Agency  
**Client:** VS Enterprises  
**Project Type:** Freelance/Admin Dashboard  
**Tech Lead:** Full-stack JavaScript/TypeScript  

---

## 📞 Support

For issues, questions, or support requests:
- Create an issue in the repository
- Contact BRX Labz Agency support
- Refer to documentation:
  - [Next.js Documentation](https://nextjs.org/docs)
  - [Clerk Documentation](https://clerk.com/docs)
  - [MongoDB Documentation](https://mongodb.com/docs)
  - [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Clerk** - For seamless authentication
- **MongoDB** - For the flexible database solution
- **Tailwind Labs** - For the utility-first CSS framework
- **Vercel** - For hosting and deployment platform

---

**Built with ❤️ by BRX Labz Agency**

*Last Updated: March 2026*
