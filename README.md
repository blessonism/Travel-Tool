# Travel Tool Project

Welcome to the Travel Tool project, a comprehensive travel itinerary generator built with Next.js. This project leverages the power of AI to create personalized travel plans, making trip planning easy and efficient. Below, you'll find detailed instructions on how to set up, use, and understand the various components of this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)
- [Usage](#usage)
- [API Routes](#api-routes)
- [Components](#components)
- [Content](#content)
- [Deployment](#deployment)
- [Learn More](#learn-more)

## Getting Started

To get started with the development server, follow these steps:

1. **Install Dependencies** 📦:

```sh
npm install
```

2. **Run the Development Server** 🚀:

```sh
npm run dev
```

3. **Open the Application** 🌐:

Open http://localhost:4000 in your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

### Root Directory

- **`.env copy`**: A copy of the environment variables configuration file.
- **`.eslintrc.json`**: ESLint configuration file.
- **`README.md`**: Project description and getting started guide.
- **`contentlayer.config.ts`**: Contentlayer configuration file.
- **`next.config.js`**: Next.js configuration file.
- **`package-lock.json`**: NPM lock file.
- **`package.json`**: Project dependencies configuration file.
- **`pnpm-lock.yaml`**: pnpm lock file.
- **`postcss.config.js`**: PostCSS configuration file.
- **`public/`**: Static resources folder.

### `src` Directory

- **`app/`**: Application code directory containing pages and API routes.
- **`components/`**: Shared components folder.
- **`content/blogs/`**: Blog content folder.
- **`lib/`**: Library folder for integrations (e.g., MailerSend, MongoDB, Stripe).

## Features

- **AI-Powered Itinerary Generation** 🤖: Generates personalized travel itineraries based on user input.
- **Webhook Support** 🔔: Handles webhooks for payment confirmation.
- **Blog Integration** 📝: Includes a blog for travel tips and guides.
- **Reusable Components** ♻️: Includes reusable React components for forms, headers, itineraries, etc.
- **Progress Tracking** 📈: Visual progress bar during itinerary generation.
- **Error Handling** ⚠️: User-friendly error messages for smooth experience.
- **Success Page** 🎉: Displays a thank you message and itinerary link upon successful checkout.

## Usage

### Homepage

The main entry point of the application is `src/app/page.tsx`. This page allows users to input their travel preferences and generates a personalized travel itinerary.

### About Page

The about page (`src/app/about/page.tsx`) provides information about the Travel AI Tool and its benefits.

### Itinerary Pages

- **Itinerary Detail Page** 📄: Display detailed information about a specific itinerary (`src/app/itinerary/[id]/page.tsx`).
- **Itinerary Actions** 🔧: Provides additional actions for the itinerary, such as exporting to calendar (`src/app/itinerary/[id]/components/Actions.tsx`).

## API Routes

### Checkout API

Handles checkout requests to facilitate payments:

- **Route**: `src/app/api/checkout/route.ts`
- **Description**: Integrates with Stripe to process payments for generated itineraries.
- Methods:
  - `POST`: Initiates a checkout session with Stripe and redirects users to the payment page.

### Itinerary Generation API

Generates travel itineraries based on user input:

- **Route**: `src/app/api/generate/route.ts`
- **Description**: Utilizes AI to create customized travel plans.
- Methods:
  - `POST`: Accepts user preferences and generates a detailed travel itinerary.

### Webhook API

Handles webhooks for payment confirmation:

- **Route**: `src/app/api/webhooks/checkout/route.ts`
- **Description**: Listens for Stripe webhook events to confirm payment status.
- Methods:
  - `POST`: Processes webhook events to update itinerary status upon successful payment.

## Components

### Form Component

Located in `src/app/components/Form.tsx`, this component handles user input for travel preferences.

### Header Component

Located in `src/app/components/Header.tsx`, this component contains the navigation menu.

### Itinerary Component

Located in `src/app/components/Itinerary.tsx`, this component displays the generated itinerary details.

### Other Components

- **Button**: `src/components/Button.tsx`
- **DateRangePicker**: `src/components/DateRangePicker.tsx`
- **Dialog**: `src/components/Dialog.tsx`
- **ListBox**: `src/components/ListBox.tsx`
- **MenuButton**: `src/components/MenuButton.tsx`
- **ModalTrigger**: `src/components/ModalTrigger.tsx`
- **Popover**: `src/components/Popover.tsx`
- **ProgressBar**: `src/components/ProgressBar.tsx`
- **Select**: `src/components/Select.tsx`
- **Toast**: `src/components/Toast.tsx`

## Content

### Blog Content

Located in `src/content/blogs/`, this directory contains markdown files for various travel-related blog posts, such as:

- **how-to-create-itineraries.md**: Tips on creating travel itineraries.
- **how-to-make-an-itinerary.md**: Guide on making a comprehensive travel plan.
- **what-are-travel-itineraries.md**: Explanation of travel itineraries and their importance.
- **why-are-itineraries-important.md**: Discussion on the benefits of having a travel itinerary.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - An interactive Next.js tutorial.

You can also check out the [Next.js GitHub repository](https://github.com/vercel/next.js/) for feedback and contributions.
