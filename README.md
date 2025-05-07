![Auto Assign](https://github.com/HireTrckr/hire-trckr-ui/actions/workflows/auto-assign.yml/badge.svg)

![Code Quality](https://github.com/HireTrckr/hire-trckr-ui/actions/workflows/prettify.yml/badge.svg)

# trckr

A job application tracking application built with Next.js, Firebase, and Zustand.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your Firebase credentials:

   - For client-side access, use the `NEXT_PUBLIC_FIREBASE_*` variables
   - For server-side access, use the `FIREBASE_*` variables
   - You'll also need to add `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from your Firebase service account

5. Run the development server:
   ```
   npm run dev
   ```

## Architecture

The application uses a serverless architecture with Next.js API routes to handle data operations. This keeps Firebase API keys secure by moving them to the server side.

### Client-Side

- React components for UI
- Zustand stores for state management
- API client for data fetching

### Server-Side

- Next.js API routes for serverless functions
- Firebase Admin SDK for secure database operations
- Environment variables for configuration

## Security Improvements

The application has been updated to improve security by:

1. Moving Firebase operations to server-side API routes
2. Using environment variables for Firebase configuration
3. Implementing Firebase Admin SDK for server-side operations
4. Keeping API keys hidden from client-side code
