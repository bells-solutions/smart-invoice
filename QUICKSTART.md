# Quick Start Guide

This is a quick reference to get SmartInvoice up and running in 5 minutes.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 13+ installed and running
- Git installed

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bells-solutions/smart-invoice.git
   cd smart-invoice
   ```

2. **Create PostgreSQL database**
   ```bash
   createdb smartinvoice
   ```
   
   Or using psql:
   ```bash
   psql -U postgres
   CREATE DATABASE smartinvoice;
   \q
   ```

3. **Install dependencies**
   ```bash
   npm run install:all
   ```
   
   Or manually:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Configure backend environment**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` file with your settings:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=smartinvoice
   JWT_SECRET=your_random_secret_key
   ```

## Running the Application

**Option 1: Run both services separately**

Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option 2: Use root scripts**

Terminal 1:
```bash
npm run dev:backend
```

Terminal 2:
```bash
npm run dev:frontend
```

## Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## First Steps

1. Navigate to http://localhost:5173
2. Click "Register" to create a new account
3. Fill in your details and submit
4. You'll be automatically logged in
5. Start by adding a client from the "Clients" page
6. Create your first invoice from the "Invoices" page
7. Download it as a PDF!

## Troubleshooting

**Database connection failed:**
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check your credentials in `backend/.env`
- Verify database exists: `psql -l | grep smartinvoice`

**Port already in use:**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.ts`

**Build errors:**
- Delete node_modules and reinstall: 
  ```bash
  rm -rf backend/node_modules frontend/node_modules
  npm run install:all
  ```

## Production Build

```bash
# Build both frontend and backend
npm run build

# Or separately
npm run build:backend
npm run build:frontend
```

## Learn More

- See [README.md](README.md) for full documentation
- See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development guide
- API documentation available in DEVELOPMENT.md

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy Invoicing! 🎉**
