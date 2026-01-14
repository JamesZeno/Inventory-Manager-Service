# Inventory Manager Service

This repository contains a full‑stack inventory management solution built with a .NET 9 backend and a React frontend.  The project is split into two main parts:

* **backend/** – A Web API written in C# that exposes CRUD endpoints for companies, warehouses, items, users, and SKU restrictions.  It uses Entity Framework Core with a SQLite database for persistence and JWT authentication for secure access.
* **frontend/** – A single‑page application (SPA) built with React and CSS. It consumes the backend API and provides a user interface for managing inventory, users, and permissions.

The goal of this project is to serve as a personal reference for building a modern, full‑stack application with clean architecture, unit tests, and a simple deployment workflow.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Backend](#backend)
	* [Prerequisites](#backend-prerequisites)
	* [Running the API](#backend-running-the-api)
	* [Testing](#backend-testing)
4. [Frontend](#frontend)
	* [Prerequisites](#frontend-prerequisites)
	* [Running the UI](#frontend-running-the-ui)
5. [Deployment](#deployment)
6. [Contributing](#contributing)
7. [License](#license)

---

## Getting Started

Clone the repository and navigate to the root folder:

```bash
git clone https://github.com/your-username/InventoryManagerService.git
cd InventoryManagerService
```

### Backend

```bash
cd backend
dotnet build
dotnet run
```

The API will be available at `https://localhost:5001` (HTTPS).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be served at `http://localhost:5173`.

---

## Project Structure

```
InventoryManagerService.sln
├─ backend/                # .NET 9 Web API
│  ├─ Controllers/         # API controllers
│  ├─ Models/              # EF Core entities
│  ├─ Services/            # Business logic services
│  ├─ Helpers/             # Utility helpers
│  ├─ AppDbContext.cs      # EF Core DbContext
│  ├─ Program.cs           # Application entry point
│  └─ backend.csproj
├─ backend.Tests/          # Unit tests for the API
│  ├─ Controllers/         # Controller tests
│  ├─ Services/            # Service tests
│  └─ backend.Tests.csproj
├─ frontend/               # React
│  ├─ src/
│  │  ├─ components/      # Reusable UI components
│  │  ├─ pages/           # Page components
│  │  ├─ context/         # React context for auth
│  │  └─ main.jsx
│  ├─ public/              # Static assets
│  ├─ vite.config.js
│  └─ package.json
└─ README.md
```

---

## Backend

### Prerequisites

* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* SQLite (bundled with EF Core provider)

### Running the API

The backend uses the default `appsettings.json` configuration.  To run in development mode:

```bash
cd backend
dotnet run
```

The API exposes the following endpoints (prefix `/api`):

| Resource | Methods | Description |
|----------|---------|-------------|
| `/companies` | GET, POST, PUT, DELETE | CRUD for companies |
| `/warehouses` | GET, POST, PUT, DELETE | CRUD for warehouses |
| `/items` | GET, POST, PUT, DELETE | CRUD for Inventory Records |
| `/allowed-skus` | GET, POST, DELETE | Manage SKUs for Items |
| `/auth` | POST | Login and obtain JWT |

### Testing

Unit tests are located in `backend.Tests`.  Run them with:

```bash
cd backend.Tests
dotnet test
```

---

## Frontend

### Prerequisites

* [Node.js](https://nodejs.org/) (v20 or newer)
* npm (comes with Node.js)

### Running the UI

```bash
cd frontend
npm install
npm run dev
```

The application will open at `http://localhost:5173`.

### Testing

The frontend uses Jest and React Testing Library.  Run tests with:

```bash
cd frontend
npm test
```

---

## Deployment

The backend can be published as a self‑contained executable:

```bash
cd backend
dotnet publish -c Release -r win-x64 --self-contained
```

The resulting `publish` folder contains the executable and all dependencies.  Deploy the `publish` folder to a Windows server or use Docker for cross‑platform deployment.

The frontend can be built for production:

```bash
cd frontend
npm run build
```

The `dist` folder can be served by any static file server or embedded in the backend as static assets.

---

## Contributing

Feel free to fork the repository and submit pull requests.  Please follow these guidelines:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Write tests for any new functionality.
3. Ensure all tests pass: `dotnet test` for backend, `npm test` for frontend.
4. Submit a pull request with a clear description of the changes.
