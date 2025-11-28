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
   # Configure .env file
   npm run develop
   ```

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
   # Run tests in headless mode (fast)
   npm run test
   
   # Run E2E tests in headed mode (browser visible, for debugging)
   npm run test:headed
   ```

4. **Generate Allure Report:**
   ```bash
   cd frontend
   npm run test:allure:generate
   npm run test:allure:open
   ```


