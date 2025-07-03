# Real Insights - Commercial Real Estate Debt Management

Welcome to Real Insights, a subscription-based SaaS platform for real estate investors and asset managers. This repository contains the source code for the entire platform.

## Project Structure

This project is a monorepo managed with pnpm workspaces.

- `apps/web`: The Next.js frontend application.
- `apps/api`: The NestJS backend API.
- `packages/ui`: Shared UI components for the frontend.
- `packages/db`: Database schema, migrations, and seed scripts.
- `packages/config`: Shared configuration files (ESLint, TypeScript, etc.).

## Getting Started

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Copy `.env.example` to `.env` in both `apps/web` and `apps/api` and fill in the required values.

3.  **Run the development servers:**
```bash
pnpm dev
    ```

This will start the frontend and backend applications concurrently.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Build Fix Thu Jul  3 16:28:25 EDT 2025
