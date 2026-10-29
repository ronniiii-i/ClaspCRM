# Clasp Workspace (Frontend)

The frontend client application for **Clasp Workspace** — a dynamic, composition-based B2B SaaS platform and Workspace OS engineered by **Princess Roni Egbu**.

This repository houses the Next.js web client that powers the multi-tenant user interface, edge routing, and primitive renderer engine. The backend REST/GraphQL API is maintained in a separate service repository (`crm-backend`).

---

## 🏛️ Frontend Architecture

### 1. Primitive UI Renderers

The interface is dynamically constructed from 5 core frontend primitive renderers. These components accept modular JSON schemas from the backend API to render customized department tools on the fly:

* **Dashboard Renderer**: Dynamic grid system for analytical widgets, KPI cards, and operational charts.
* **Data Table Renderer**: Virtualized data grid supporting custom columns, server-side filtering, sorting, and inline editing.
* **Kanban Renderer**: Stage-based process board with fluid drag-and-drop workflow progression.
* **Document Hub Renderer**: Rich-text editing, team wiki structures, and SOP management.
* **Form Builder Renderer**: Dynamic form generation for structured data intake and workflow triggers.

### 2. Edge Subdomain Routing

* **Multi-Tenant Subdomain Isolation**: Native support for `https://[tenant].claspworkspace.work.gd`.
* **Next.js Middleware**: Edge-level subdomain extraction, origin verification, and internal dynamic routing (`/[tenant]/(app)/...`).
* **Zero-Config Local Multi-Tenancy**: Native local subdomain testing out of the box using `*.localhost:3000`.

### 3. State Management & Auth Handshake

* **Authentication**: JWT auth stored in secure httpOnly cookies with Zustand auth store hydration.
* **Workspace Context**: Global tenant and department context providers managing active scopes across views.
* **Data Fetching**: TanStack Query (React Query) for optimistic UI updates, background revalidation, and request deduplication.

---

## 🛠️ Frontend Tech Stack

* **Framework**: Next.js 15 (App Router, Server Components & Client Hooks)
* **Language**: TypeScript 5.0+
* **Styling**: Tailwind CSS, Radix UI Primitives, Lucide React Icons
* **State Management**: Zustand
* **Data Fetching & Caching**: TanStack Query v5
* **Forms & Validation**: React Hook Form, Zod
* **Deployment & Edge**: Vercel / Render Edge

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `v20.0.0` or higher
* **npm**: `v10.0.0` or higher
* **Clasp Backend API**: Running locally on port `3030` or available via remote staging (`crm-backend-6g9p.onrender.com`).

---

### 1. Installation

```bash
git clone https://github.com/ronniiii-i/clasp-workspace.git
cd clasp-workspace
npm install
```

---

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Root Domain Config (Use localhost:3000 for local testing)
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"

# Target Backend API Endpoint (Separate Repo)
NEXT_PUBLIC_API_URL="http://localhost:3030"

# Base Site URL for Canonical SEO & Metadata
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

### 3. Local Subdomain Testing

Modern web browsers natively resolve `*.localhost` to `127.0.0.1`. You do not need to modify your local `/etc/hosts` file:

* **Marketing Landing Page**: `http://localhost:3000`
* **Tenant Workspace Demo**: `http://acme.localhost:3000`

---

### 4. Development Commands

```bash
# Start Next.js development server
npm run dev

# Run TypeScript type-checking & linting
npm run lint

# Build production bundle
npm run build

# Start production server
npm start
```

---

## 📂 Project Structure

```tree
clasp-workspace/
├── src/
│   ├── app/
│   │   ├── (marketing)/         # Public landing, pricing & marketing pages
│   │   ├── (auth)/              # Login, Register, Forgot/Reset Password
│   │   └── (tenant)/            # Authenticated workspace routes
│   │       └── [tenant]/        # Dynamic tenant subdomain wrapper
│   │           └── (app)/       # Authenticated dashboard & primitives
│   ├── components/
│   │   ├── layout/              # Navigation, Dashboard Shell, Sidebar
│   │   ├── primitives/          # The 5 Core UI Renderers
│   │   └── ui/                  # Atomic UI design system (Buttons, Dialogs, Inputs)
│   ├── hooks/                   # Custom React hooks (Data fetching, UI state)
│   ├── lib/                     # API client, SEO metadata generators, Formatters
│   ├── stores/                  # Zustand stores (Auth, Active Tenant, Sidebar)
│   └── middleware.ts            # Edge routing, Subdomain rewriter & Auth guard
├── public/                      # Static branding assets & manifest
└── tailwind.config.ts           # Tailwind CSS configuration
```

---

## 🔒 Copyright & License

© 2026 **Princess Roni Egbu**. All rights reserved.

This software and its associated documentation files are **proprietary and confidential**. Unauthorized copying, modification, distribution, or reverse engineering of any part of this project via any medium is strictly prohibited without explicit written permission from the copyright owner.
