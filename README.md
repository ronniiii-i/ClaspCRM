# ClaspCRM

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.0+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)

Modern CRM frontend built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

### Authentication

- ✅ JWT-based authentication
- ✅ Email verification flow
- ✅ Password reset functionality
- ✅ Role-based access control (Admin/Head of Department/Manager(Lead)/User)
- ✅ Secure cookie management

### Modules

- [x] Dashboard
- [ ] Contact Management
- [ ] Project Management
- [ ] HR Management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ or yarn
- Backend API running (see [backend repo](https://github.com/ronniiii-i/crm-backend))

### Installation

```bash
git clone https://github.com/your-username/crm-frontend.git
cd crm-frontend
npm install
```

### Configuration

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3030
```

### Running the App

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## 📂 Project Structure

```tree
crm-frontend/
├── src/
│   ├── app/               # App router
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities/helpers
│   ├── middleware.ts      # Auth middleware
│   └── types/             # TypeScript types
├── public/                # Static assets
└── tailwind.config.js     # Tailwind config
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
