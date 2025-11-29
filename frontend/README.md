# Frontend - E-commerce Next.js Application

Frontend application built with Next.js 13 for the e-commerce project with Strapi. Includes a complete automated test suite with Playwright.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── brands/         # Brand components
│   │   ├── cart/           # Shopping cart components
│   │   ├── form/           # Forms (auth, checkout, profile)
│   │   ├── home/           # Home page components
│   │   ├── layouts/        # Layouts and page structure
│   │   ├── product-detail/ # Product details
│   │   ├── product-list/   # Product list and filters
│   │   ├── search/         # Search components
│   │   └── ui/             # Base UI components (shadcn/ui)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API routes (NextAuth)
│   │   ├── product/        # Product pages
│   │   ├── profile/        # Profile pages
│   │   └── ...
│   ├── services/           # API services (Strapi)
│   ├── store/              # Global state (Zustand)
│   ├── types/              # TypeScript definitions
│   └── validations/        # Zod validations
├── tests/                  # Playwright tests
│   ├── api/                # API tests
│   ├── e2e/                # End-to-end tests
│   └── utils/              # Test helpers
├── public/                 # Static files
└── playwright.config.ts   # Playwright configuration
```

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Configuration

The `.env.local` file is already configured with all necessary variables, including `NEXTAUTH_SECRET`. No additional configuration is required.

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🧪 Playwright Testing

This project includes a complete automated test suite using Playwright to ensure application quality and functionality.

### Playwright Configuration

The `playwright.config.ts` file contains all configuration:

- **Timeout:** 60 seconds per test
- **Browsers:** Chromium (default), Firefox, WebKit
- **Base URL:** `http://localhost:3000`
- **Reports:** HTML, Allure, JSON, List
- **Videos:** Always recorded
- **Screenshots:** Only on failures
- **Traces:** On retries

### Test Structure

```
tests/
├── api/                    # API tests (Strapi)
│   ├── auth.spec.ts        # Authentication
│   ├── checkout.spec.ts    # Checkout process
│   └── products.spec.ts    # Products
├── e2e/                    # End-to-end tests
│   ├── login.spec.ts              # Login flow
│   ├── add-to-cart.spec.ts        # Add to cart
│   ├── checkout.spec.ts           # Checkout process
│   ├── negative-login.spec.ts     # Negative login scenarios
│   ├── negative-add-to-cart.spec.ts # Negative cart scenarios
│   └── negative-checkout.spec.ts  # Negative checkout scenarios
└── utils/                  # Test utilities
    ├── test-helpers.ts     # General helpers
    ├── e2e-test-helpers.ts # E2E helpers
    └── api-test-helpers.ts # API helpers
```

### Test Commands

#### Run all tests (headless)
```bash
npm run test
```
Runs all tests (API + E2E) in headless mode using Chromium.

#### Run only API tests
```bash
npm run test:api
```
Runs only API tests (`tests/api/`) in headless mode. Fast execution since no browser is needed.

#### Run E2E tests in headed mode (visible browser)
```bash
npm run test:headed
```
Runs only E2E tests (`tests/e2e/`) with visible browser, useful for visual debugging.

#### Run all tests (API headless + E2E headed)
```bash
npm run test:all
```
Runs API tests in headless mode first, then E2E tests with visible browser. Best of both worlds - fast API tests and visual E2E debugging.

#### Generate Allure report
```bash
npm run test:allure:generate
npm run test:allure:open
```
Generates and opens the visual Allure report with all test results.

### Test Types

#### 1. API Tests (`tests/api/`)

Test Strapi endpoints directly without needing a browser:

- **auth.spec.ts:** User authentication
  - Valid login
  - Invalid credentials rejection
  - Email format validation
  - Required fields validation

- **checkout.spec.ts:** Checkout process
  - Address validation
  - Shipping rate calculation
  - Order creation
  - Authentication validation

- **products.spec.ts:** Product management
  - Product listing
  - Pagination
  - Search by name
  - Relations (populate)

#### 2. E2E Tests (`tests/e2e/`)

Test the complete application flow from the user's perspective:

- **login.spec.ts:** Login flow
  - Successful login with valid credentials
  - Correct form display

- **add-to-cart.spec.ts:** Add products to cart
  - Add a product and update counter
  - Add multiple products

- **checkout.spec.ts:** Checkout process
  - Complete checkout successfully
  - View products on checkout page

- **negative-*.spec.ts:** Negative scenarios
  - Login attempts with invalid credentials
  - Add products without authentication
  - Checkout with empty cart
  - Form validations

### Helpers and Utilities

#### `tests/utils/test-helpers.ts`
General shared functions:
- `login()`: Authentication helper
- `TEST_USER`: Test credentials

#### `tests/utils/e2e-test-helpers.ts`
E2E-specific utilities:
- `step()`: Organize test steps
- `takeScreenshot()`: Capture screenshots with context
- `setupApiCapture()`: Capture API responses

#### `tests/utils/api-test-helpers.ts`
API test utilities:
- `attachApiResponse()`: Attach responses to report
- `API_BASE_URL`: API base URL

### Reports

Tests generate multiple types of reports:

1. **HTML Report:** `playwright-report/index.html`
   - Opens automatically after running tests
   - Includes videos, screenshots, and traces

2. **Allure Report:** `allure-report/`
   - Advanced visual report with metrics
   - Generated with `npm run test:allure:generate`

3. **JSON Report:** `test-results.json`
   - Structured format for CI/CD

4. **Videos:** `test-results/`
   - Videos of each executed test
   - Useful for debugging

### Best Practices

1. **Before running tests:**
   - Ensure the backend (Strapi) is running on `http://localhost:1337`
   - Ensure the frontend is running on `http://localhost:3000`

2. **For debugging:**
   - Use `npm run test:headed` to see the browser
   - Check videos in `test-results/` if a test fails
   - Use `test.only()` temporarily to run a single test

3. **Writing new tests:**
   - Use `step()` to organize steps
   - Capture screenshots at key points
   - Use existing helpers when possible
   - Follow the structure of existing tests

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Tests
npm run test         # Run all tests (headless)
npm run test:api     # Run only API tests
npm run test:headed  # Run E2E tests with visible browser
npm run test:all     # Run API (headless) + E2E (headed)

# Reports
npm run test:allure:generate  # Generate Allure report
npm run test:allure:open     # Open Allure report

# Linting and Formatting
npm run lint         # Run ESLint
npm run lintfix      # Run Prettier and ESLint with --fix
npm run prettier     # Format code with Prettier
```

## 🛠️ Technologies

- **Next.js 13** - React framework
- **TypeScript** - Static typing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - Global state
- **React Hook Form** - Form handling
- **Zod** - Validation
- **NextAuth** - Authentication
- **Playwright** - E2E testing
- **Allure** - Test reports

## 📝 Important Notes

- The `.env.local` file contains all necessary environment variables
- Tests are configured to run only on Chromium by default (faster)
- Test videos are saved in `test-results/` and may take up space
- Allure reports are generated in `allure-results/` and `allure-report/`
