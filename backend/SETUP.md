# Backend Setup Guide

This guide explains how to set up the Strapi backend on a new machine.

## Problem

When you clone this repository, the database (`.tmp/data.db`) is empty because it's ignored by git. The backend will start but won't have any data (products, users, categories, etc.).

## Solution: Use Initial Database (Recommended)

The repository includes an initial database with all necessary data in `database/initial/data.db`.

1. Copy the initial database to the Strapi data directory:
   ```bash
   cd backend
   mkdir -p .tmp
   cp database/initial/data.db .tmp/data.db
   ```

2. Start Strapi:
   ```bash
   npm run develop
   ```

3. Verify it works:
   - Admin panel: `http://localhost:1337/admin`
   - API: `http://localhost:1337/api/products`

The initial database includes:
- Test user: `test@example.com` / `Test123456!`
- Sample products, brands, and categories
- All content types configured
- Proper permissions set

## Alternative: Manual Setup

If you prefer to set up manually:

1. Start Strapi and create admin user
2. Create test user: `test@example.com` / `Test123456!`
3. Create brands, categories, and products
4. Set permissions in Settings → Users & Permissions → Roles → Public

## Required Data for Tests

- Test user: `test@example.com` / `Test123456!` (must be confirmed)
- At least one product with stock > 0
- Public permissions enabled for all content types

