# E-commerce QA Automation Project

Complete e-commerce testing project with Next.js frontend and Strapi backend.
## Project Structure

```
strapi-ecommerce-project/
├── backend/          # Strapi CMS backend
└── frontend/         # Next.js frontend + QA automation tests
```

## Quick Start

1. **Setup Backend:**
   ```bash
   cd backend
   npm install --legacy-peer-deps
   npm install sqlite3
   # Copy initial database (includes test data)
   mkdir -p .tmp
   cp database/initial/data.db .tmp/data.db
   # Configure .env file if needed
   npm run develop
   ```
   
   **Note:** See `backend/SETUP.md` for detailed setup instructions and troubleshooting.

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   # .env.local already includes NEXTAUTH_SECRET - no configuration needed
   npm run dev
   ```

3. **Run Tests:**
   ```bash
   cd frontend
   # Run all tests (API + E2E) in headless mode (fast)
   npm run test
   
   # Run only API tests (no browser needed, very fast)
   npm run test:api
   
   # Run only E2E tests in headed mode (browser visible, for debugging)
   npm run test:headed
   
   # Run all tests: API (headless) + E2E (headed browser visible)
   npm run test:all
   ```

4. **Generate Allure Report:**
   ```bash
   cd frontend
   npm run test:allure:generate
   npm run test:allure:open
   ```


