# smart-invoice
SmartInvoice is a lightweight SaaS for small businesses and freelancers to quickly create, manage, and send professional invoices and receipts. Built with NestJS, PostgreSQL, Vue 3, and TailwindCSS, it combines simplicity, speed, and scalability to help businesses stay organized and save time.

## Features

- **User Authentication**: Secure JWT-based registration and login
- **Client Management**: Create, edit, and manage client information
- **Invoice Creation**: Create invoices with multiple items and automatic totals
- **Tax Calculation**: Optional tax rate with automatic calculation
- **PDF Export**: Generate professional PDF invoices with branding
- **Dashboard**: Track total sales, unpaid invoices, and key metrics
- **Invoice Status Tracking**: Track invoice status (Draft, Sent, Paid, Overdue)

## Tech Stack

### Backend
- NestJS - TypeScript framework for building scalable server-side applications
- PostgreSQL - Relational database
- TypeORM - ORM for TypeScript and JavaScript
- JWT - JSON Web Tokens for authentication
- PDFKit - PDF generation library

### Frontend
- Vue 3 - Progressive JavaScript framework
- TypeScript - Typed superset of JavaScript
- Tailwind CSS - Utility-first CSS framework
- Vite - Next generation frontend tooling
- Pinia - State management for Vue
- Vue Router - Official router for Vue.js
- Axios - HTTP client

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials and JWT secret.

5. Make sure PostgreSQL is running and create the database:
```bash
createdb smartinvoice
```

6. Start the backend server:
```bash
npm run start:dev
```

The backend will be running at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Usage

1. Register a new account at `/register`
2. Login with your credentials at `/login`
3. Add clients from the Clients page
4. Create invoices from the Invoices page
5. Download invoices as PDF
6. Track your sales and unpaid invoices on the Dashboard

## Testing

### Backend Tests (Jest)

Run backend tests:
```bash
cd backend
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage
```

### Frontend Tests (Vitest)

Run frontend tests:
```bash
cd frontend
npm test                  # Run all tests
npm run test:ui           # Run tests with UI
npm run test:coverage     # Run tests with coverage
```

### Run All Tests

From the root directory:
```bash
npm test                  # Run both backend and frontend tests
npm run test:coverage     # Run all tests with coverage
```

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The build output will be in the `frontend/dist` directory.

## License

ISC
