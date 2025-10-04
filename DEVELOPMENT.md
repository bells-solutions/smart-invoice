# SmartInvoice Development Guide

## Project Structure

```
smart-invoice/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Authentication module (JWT)
│   │   ├── users/             # User entity and module
│   │   ├── clients/           # Client management module
│   │   ├── invoices/          # Invoice management module
│   │   ├── common/            # Shared utilities (guards, decorators)
│   │   ├── app.module.ts      # Main application module
│   │   └── main.ts           # Application entry point
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript configuration
│
├── frontend/                  # Vue 3 Frontend
│   ├── src/
│   │   ├── components/       # Reusable Vue components
│   │   ├── views/            # Page components
│   │   ├── router/           # Vue Router configuration
│   │   ├── stores/           # Pinia state management
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.vue           # Root component
│   │   ├── main.ts           # Application entry point
│   │   └── style.css         # Global styles with Tailwind
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── tsconfig.json         # TypeScript configuration
│
├── README.md                 # Project documentation
└── .gitignore               # Git ignore rules
```

## Features Implemented

### Backend (NestJS + PostgreSQL)
- ✅ User authentication with JWT tokens
- ✅ User registration and login endpoints
- ✅ Protected routes with JWT guards
- ✅ Client CRUD operations
- ✅ Invoice CRUD operations with line items
- ✅ Automatic invoice number generation
- ✅ Tax calculation (configurable tax rate)
- ✅ PDF invoice generation with PDFKit
- ✅ Dashboard statistics endpoint
- ✅ TypeORM with PostgreSQL database
- ✅ Input validation with class-validator

### Frontend (Vue 3 + TypeScript + Tailwind)
- ✅ User authentication (login/register)
- ✅ Protected routes with navigation guards
- ✅ Client management interface
- ✅ Invoice creation and editing
- ✅ Dynamic invoice item management
- ✅ Automatic subtotal, tax, and total calculation
- ✅ Invoice status tracking (draft, sent, paid, overdue)
- ✅ PDF download functionality
- ✅ Dashboard with sales metrics
- ✅ Responsive design with Tailwind CSS
- ✅ State management with Pinia
- ✅ Type-safe API calls with Axios

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Clients (Protected)
- `GET /clients` - Get all clients for the authenticated user
- `GET /clients/:id` - Get a specific client
- `POST /clients` - Create a new client
- `PUT /clients/:id` - Update a client
- `DELETE /clients/:id` - Delete a client

### Invoices (Protected)
- `GET /invoices` - Get all invoices for the authenticated user
- `GET /invoices/:id` - Get a specific invoice
- `POST /invoices` - Create a new invoice
- `PUT /invoices/:id` - Update an invoice
- `DELETE /invoices/:id` - Delete an invoice
- `GET /invoices/:id/pdf` - Download invoice as PDF
- `GET /invoices/dashboard/stats` - Get dashboard statistics

## Database Schema

### Users Table
- id (UUID, Primary Key)
- email (String, Unique)
- password (String, Hashed)
- firstName (String)
- lastName (String)
- companyName (String, Optional)
- companyLogo (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Clients Table
- id (UUID, Primary Key)
- name (String)
- email (String)
- phone (String, Optional)
- address (String, Optional)
- city (String, Optional)
- country (String, Optional)
- userId (UUID, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)

### Invoices Table
- id (UUID, Primary Key)
- invoiceNumber (String, Auto-generated)
- status (Enum: draft, sent, paid, overdue)
- issueDate (Date)
- dueDate (Date)
- subtotal (Decimal)
- taxRate (Decimal)
- taxAmount (Decimal)
- total (Decimal)
- notes (Text, Optional)
- userId (UUID, Foreign Key)
- clientId (UUID, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)

### Invoice Items Table
- id (UUID, Primary Key)
- description (String)
- quantity (Integer)
- unitPrice (Decimal)
- amount (Decimal)
- invoiceId (UUID, Foreign Key)

## Testing

### Backend Tests (Jest)

The backend uses Jest for unit testing with the following setup:

**Test Structure:**
- `src/**/*.spec.ts` - Test files
- `jest.config.js` - Jest configuration
- Coverage reports in `backend/coverage/`

**Running Tests:**
```bash
cd backend
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage report
```

**Test Coverage:**
- Auth Service: Register, login, user validation
- Clients Service: CRUD operations
- Invoices Service: Invoice creation, calculations, dashboard stats

### Frontend Tests (Vitest)

The frontend uses Vitest for unit testing with the following setup:

**Test Structure:**
- `src/**/*.test.ts` - Test files
- `vitest.config.ts` - Vitest configuration
- Coverage reports in `frontend/coverage/`

**Running Tests:**
```bash
cd frontend
npm test                  # Run all tests
npm run test:ui           # Run tests with interactive UI
npm run test:coverage     # Run tests with coverage report
```

**Test Coverage:**
- Auth Store: Login, register, logout functionality
- Service Layer: API calls for clients and invoices
- Vue Components: Login component rendering and behavior

### Running All Tests

From the root directory:
```bash
npm test                  # Run both backend and frontend tests
npm run test:coverage     # Run all tests with coverage
```

**Test Statistics:**
- Backend: 19 tests across 3 test suites
- Frontend: 20 tests across 4 test suites
- Total: 39 tests with 100% pass rate

## Development Workflow

### First Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bells-solutions/smart-invoice.git
   cd smart-invoice
   ```

2. **Set up PostgreSQL**

   **Option A: Using Docker (Recommended for Development)**
   ```bash
   # Start PostgreSQL in a Docker container
   docker-compose up -d
   
   # Verify it's running
   docker-compose ps
   
   # View logs if needed
   docker-compose logs postgres
   ```
   
   The database is automatically configured with:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: postgres
   - Database: smartinvoice
   
   **Option B: Using Local PostgreSQL Installation**
   ```bash
   # Install PostgreSQL if not already installed
   # Create database
   createdb smartinvoice
   ```

3. **Configure Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   # Note: If using Docker, the default values work without modification
   npm install
   ```

4. **Configure Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running in Development

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
Backend runs on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist/ folder with your web server
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=smartinvoice
JWT_SECRET=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=/api
```

## Testing the Application

1. **Register a new user**
   - Navigate to http://localhost:5173/register
   - Fill in the registration form
   - You'll be automatically logged in

2. **Add clients**
   - Go to Clients page
   - Click "Add Client"
   - Fill in client details

3. **Create invoices**
   - Go to Invoices page
   - Click "Create Invoice"
   - Select a client
   - Add line items
   - Set tax rate if needed
   - Save the invoice

4. **Download PDF**
   - From the invoices list, click "PDF" button
   - The invoice will be downloaded as a PDF file

5. **View Dashboard**
   - Navigate to Dashboard
   - See total sales, unpaid invoices, and other metrics

## Technology Decisions

### Why PostgreSQL over CouchDB?
- PostgreSQL provides strong ACID compliance for financial data
- Better support for complex queries and relationships
- More mature ecosystem for TypeScript/NestJS
- Easier to work with relational data (users, clients, invoices)

### Why NestJS?
- Built-in support for TypeScript
- Modular architecture with dependency injection
- Excellent TypeORM integration
- Built-in validation and security features
- Great for building scalable REST APIs

### Why Vue 3?
- Composition API for better TypeScript support
- Reactive state management with Pinia
- Lightweight and performant
- Excellent developer experience

### Why Tailwind CSS?
- Utility-first approach for rapid UI development
- No need to write custom CSS
- Highly customizable
- Small production bundle size with purging

## Next Steps / Future Enhancements

- [ ] Add email functionality to send invoices to clients
- [ ] Implement recurring invoices
- [ ] Add payment tracking and reminders
- [ ] Multi-currency support
- [ ] Invoice templates and customization
- [ ] Company logo upload
- [ ] Advanced reporting and analytics
- [ ] Export data to CSV/Excel
- [ ] Client portal for viewing invoices
- [ ] Integration with payment gateways
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## Troubleshooting

### Database Connection Issues
- If using Docker: 
  - Ensure Docker is running: `docker --version`
  - Check container status: `docker-compose ps`
  - View logs: `docker-compose logs postgres`
  - Restart container: `docker-compose restart postgres`
- If using local PostgreSQL:
  - Ensure PostgreSQL is running
  - Check database credentials in .env
  - Verify database exists: `psql -l`

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Change port in vite.config.ts

### TypeScript Errors
- Run `npm install` in both backend and frontend
- Check that all dependencies are installed
- Run `npm run build` to verify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC
